import fs from "node:fs/promises";
import process from "node:process";
import { MongoClient } from "mongodb";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: node scripts/import-applications.mjs <export.json>");
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

const statuses = new Set(["Applied", "Followed up", "Interview", "Offer", "Rejected", "Closed"]);
const sources = new Set(["Email", "Indeed", "Naukri", "LinkedIn", "Company site", "Infopark", "Referral", "Other"]);
const maxTextLength = 2000;

function dateIsValid(value, field, required = false) {
  if (!value && !required) return;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${field} must use YYYY-MM-DD format`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(`${field} is not a valid date`);
}

function normalize(row, index) {
  if (!row || typeof row !== "object") throw new Error(`Record ${index + 1} must be an object`);
  const source = row.source ?? "";
  const status = row.status ?? "Applied";
  if (typeof row.id !== "string" || !row.id.trim()) throw new Error(`Record ${index + 1} has no valid id`);
  if (typeof row.company !== "string" || !row.company.trim()) throw new Error(`Record ${index + 1} has no company`);
  if (!statuses.has(status)) throw new Error(`Record ${index + 1} has invalid status`);
  if (source && !sources.has(source)) throw new Error(`Record ${index + 1} has invalid source`);
  dateIsValid(row.applied, "applied", true);
  dateIsValid(row.followUp ?? "", "followUp");
  if (row.link) {
    const url = new URL(row.link);
    if (!/^https?:$/.test(url.protocol)) throw new Error(`Record ${index + 1} link must be HTTP or HTTPS`);
  }

  const textFields = ["company", "role", "source", "location", "applied", "followUp", "contact", "link", "notes", "rejectReason", "salary", "workMode"];
  for (const field of textFields) {
    const value = row[field] ?? "";
    if (typeof value !== "string") throw new Error(`Record ${index + 1} field ${field} must be text`);
    if (value.length > maxTextLength) throw new Error(`Record ${index + 1} field ${field} is too long`);
  }
  if (status === "Rejected" && !row.rejectReason?.trim()) throw new Error(`Record ${index + 1} needs a rejection reason`);

  return {
    _id: row.id.trim(),
    company: row.company.trim(),
    role: row.role?.trim() ?? "",
    source: source.trim(),
    location: row.location?.trim() ?? "",
    applied: row.applied,
    status,
    followUp: row.followUp?.trim() ?? "",
    contact: row.contact?.trim() ?? "",
    link: row.link?.trim() ?? "",
    notes: row.notes?.trim() ?? "",
    rejectReason: status === "Rejected" ? row.rejectReason.trim() : "",
    salary: row.salary?.trim() ?? "",
    workMode: row.workMode?.trim() ?? "",
    createdAt: Number.isFinite(row.createdAt) ? row.createdAt : Date.now(),
    updatedAt: Number.isFinite(row.updatedAt) ? row.updatedAt : Date.now(),
  };
}

const records = JSON.parse(await fs.readFile(inputPath, "utf8"));
if (!Array.isArray(records)) throw new Error("Export root must be an array");
const documents = records.map(normalize);
const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const collection = client.db(process.env.MONGODB_DB || "job-tracker").collection("applications");
  await collection.createIndexes([
    { key: { applied: -1 }, name: "applications_applied_desc" },
    { key: { updatedAt: -1 }, name: "applications_updated_desc" },
    { key: { status: 1 }, name: "applications_status" },
  ]);
  const result = await collection.bulkWrite(
    documents.map((document) => ({ replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true } })),
    { ordered: true },
  );
  console.log(JSON.stringify({ records: documents.length, inserted: result.upsertedCount, replaced: result.modifiedCount }, null, 2));
} finally {
  await client.close();
}
