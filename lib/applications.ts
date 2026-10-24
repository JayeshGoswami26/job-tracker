import { randomUUID } from "crypto";
import { getApplicationsCollection, type ApplicationDocument } from "./db";
import { STATUSES, type App, type Draft, type Status } from "./types";

const TEXT_FIELDS = [
  "company",
  "role",
  "source",
  "location",
  "applied",
  "followUp",
  "contact",
  "link",
  "notes",
  "rejectReason",
  "salary",
  "workMode",
] as const;

const BLANK: Draft = {
  company: "",
  role: "",
  source: "",
  location: "",
  applied: "",
  status: "Applied",
  followUp: "",
  contact: "",
  link: "",
  notes: "",
  rejectReason: "",
  salary: "",
  workMode: "",
};

function parse(input: unknown): Partial<Draft> {
  if (typeof input !== "object" || input === null) throw new Error("Invalid request body");
  const src = input as Record<string, unknown>;
  const out: Partial<Draft> = {};
  for (const key of TEXT_FIELDS) {
    if (!(key in src)) continue;
    const v = src[key];
    if (v == null) out[key] = "";
    else if (typeof v === "string") out[key] = v.trim().slice(0, 2000);
    else throw new Error(`${key} must be text`);
  }
  if ("status" in src) {
    const s = src.status;
    if (typeof s !== "string" || !(STATUSES as readonly string[]).includes(s)) throw new Error("Invalid status");
    out.status = s as Status;
  }
  return out;
}

function finalize(fields: Partial<Draft>, base: Draft): Draft {
  const merged: Draft = { ...base, ...fields };
  if (!merged.company) throw new Error("Company is required");
  if (!merged.applied) throw new Error("Date applied is required");
  if (merged.status === "Rejected" && !merged.rejectReason) throw new Error("Reason for rejection is required");
  if (merged.status !== "Rejected") merged.rejectReason = "";
  return merged;
}

function toApp(doc: ApplicationDocument): App {
  const { _id, salary, workMode, ...rest } = doc;
  return {
    ...rest,
    // Documents created before these fields existed have no stored value.
    salary: salary ?? "",
    workMode: workMode ?? "",
    id: _id,
  };
}

export async function listApplications(): Promise<App[]> {
  const collection = await getApplicationsCollection();
  const docs = await collection.find({}).sort({ applied: -1 }).toArray();
  return docs.map(toApp);
}

export async function getApplication(id: string): Promise<App | null> {
  const collection = await getApplicationsCollection();
  const doc = await collection.findOne({ _id: id });
  return doc ? toApp(doc) : null;
}

export async function createApplication(input: unknown): Promise<App> {
  const draft = finalize(parse(input), BLANK);
  const now = Date.now();
  const id = randomUUID();
  const collection = await getApplicationsCollection();

  const doc: ApplicationDocument = {
    ...draft,
    _id: id,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(doc);
  return toApp(doc);
}

export async function updateApplication(id: string, input: unknown): Promise<App | null> {
  const current = await getApplication(id);
  if (!current) return null;
  const draft = finalize(parse(input), current);
  const updatedAt = Date.now();

  const collection = await getApplicationsCollection();
  await collection.updateOne(
    { _id: id },
    {
      $set: {
        ...draft,
        updatedAt,
      },
    }
  );

  return getApplication(id);
}

export async function deleteApplication(id: string): Promise<boolean> {
  const collection = await getApplicationsCollection();
  const res = await collection.deleteOne({ _id: id });
  return res.deletedCount > 0;
}
