import { randomUUID } from "crypto";
import { db } from "./db";
import { STATUSES, type App, type Draft, type Status } from "./types";

const TEXT_FIELDS = [
  "company", "role", "source", "location", "applied", "followUp",
  "contact", "link", "notes", "rejectReason",
] as const;

const BLANK: Draft = {
  company: "", role: "", source: "", location: "", applied: "", status: "Applied",
  followUp: "", contact: "", link: "", notes: "", rejectReason: "",
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

export function listApplications(): App[] {
  return db.prepare("SELECT * FROM applications ORDER BY applied DESC").all() as App[];
}

export function getApplication(id: string): App | undefined {
  return db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as App | undefined;
}

export function createApplication(input: unknown): App {
  const draft = finalize(parse(input), BLANK);
  const now = Date.now();
  const id = randomUUID();
  db.prepare(`
    INSERT INTO applications
      (id, company, role, source, location, applied, status, followUp, contact, link, notes, rejectReason, createdAt, updatedAt)
    VALUES
      (@id, @company, @role, @source, @location, @applied, @status, @followUp, @contact, @link, @notes, @rejectReason, @createdAt, @updatedAt)
  `).run({ ...draft, id, createdAt: now, updatedAt: now });
  return getApplication(id) as App;
}

export function updateApplication(id: string, input: unknown): App | null {
  const current = getApplication(id);
  if (!current) return null;
  const draft = finalize(parse(input), current);
  db.prepare(`
    UPDATE applications SET
      company = @company, role = @role, source = @source, location = @location,
      applied = @applied, status = @status, followUp = @followUp, contact = @contact,
      link = @link, notes = @notes, rejectReason = @rejectReason, updatedAt = @updatedAt
    WHERE id = @id
  `).run({ ...draft, id, updatedAt: Date.now() });
  return getApplication(id) as App;
}

export function deleteApplication(id: string): boolean {
  return db.prepare("DELETE FROM applications WHERE id = ?").run(id).changes > 0;
}
