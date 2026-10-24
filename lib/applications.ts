import { randomUUID } from "crypto";
import type { Sort } from "mongodb";
import { getApplicationsCollection, type ApplicationDocument } from "./db";
import { dueState } from "./status";
import { SOURCES, STATUSES, WORK_MODES, type App, type ApplicationSort, type Draft, type Status } from "./types";

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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateDate(value: string, field: string, required: boolean) {
  if (!value && !required) return;
  if (!isValidDate(value)) throw new Error(`${field} must use YYYY-MM-DD format`);
}

function validateUrl(value: string) {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error("link must be a valid HTTP or HTTPS URL");
  }
}

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
  if (out.source && !(SOURCES as readonly string[]).includes(out.source)) throw new Error("Invalid source");
  if (out.workMode && !(WORK_MODES as readonly string[]).includes(out.workMode)) throw new Error("Invalid work mode");
  return out;
}

function finalize(fields: Partial<Draft>, base: Draft): Draft {
  const merged: Draft = { ...base, ...fields };
  if (!merged.company) throw new Error("Company is required");
  validateDate(merged.applied, "applied", true);
  validateDate(merged.followUp, "followUp", false);
  validateUrl(merged.link);
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

type ListOptions = {
  page: number;
  pageSize: number;
  query: string;
  status: string;
  source: string;
  sort: ApplicationSort;
};

type ListResult = {
  items: App[];
  total: number;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listApplicationsPage(options: ListOptions): Promise<ListResult> {
  const collection = await getApplicationsCollection();
  const filters: Record<string, unknown>[] = [];
  const query = options.query.trim();
  if (query) {
    const expression = { $regex: escapeRegex(query), $options: "i" };
    filters.push({ $or: [
      { company: expression },
      { role: expression },
      { contact: expression },
      { notes: expression },
      { location: expression },
    ] });
  }
  if (options.status === "Active") filters.push({ status: { $in: ["Applied", "Followed up", "Interview"] } });
  else if (options.status && options.status !== "All") filters.push({ status: options.status });
  if (options.source) filters.push({ source: options.source });

  const filter = filters.length ? { $and: filters } : {};
  const sort: Sort = options.sort === "applied"
    ? { applied: -1, updatedAt: -1 }
    : options.sort === "followUp"
      ? { followUp: 1, updatedAt: -1 }
      : options.sort === "company"
        ? { company: 1, updatedAt: -1 }
        : { updatedAt: -1 };
  const [total, docs] = await Promise.all([
    collection.countDocuments(filter),
    collection.find(filter).sort(sort).skip((options.page - 1) * options.pageSize).limit(options.pageSize).toArray(),
  ]);
  return { items: docs.map(toApp), total };
}

export async function getApplicationSummary() {
  const collection = await getApplicationsCollection();
  const [total, grouped, activeDocs] = await Promise.all([
    collection.countDocuments(),
    collection.aggregate<{ _id: Status; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).toArray(),
    collection.find({ status: { $in: ["Applied", "Followed up"] } }).toArray(),
  ]);
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<Status, number>;
  for (const row of grouped) {
    if (row._id in byStatus) byStatus[row._id] = row.count;
  }
  const active = byStatus.Applied + byStatus["Followed up"];
  const activeTab = active + byStatus.Interview;
  const due = activeDocs.map(toApp).filter((app) => dueState(app) !== null);
  return { total, active, activeTab, byStatus, due };
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
