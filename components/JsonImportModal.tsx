"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { apiRequest } from "@/lib/api";
import { SOURCES, STATUSES, WORK_MODES } from "@/lib/types";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Textarea } from "./ui/Textarea";
import { Document, Upload } from "./ui/icons";

type ImportResult = {
  createdCount: number;
  skippedCount: number;
  skipped: { index: number; reason: string }[];
  errors: { index: number; message: string }[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onImported: (result: ImportResult) => void;
};

type JsonRecord = Record<string, unknown>;
type ImportItem = Record<string, string>;
type PreviewError = { index: number; message: string };

const aliases: Record<string, string[]> = {
  company: ["companyName", "employer", "organization"],
  role: ["jobTitle", "title", "position"],
  source: ["appliedVia", "platform"],
  applied: ["appliedDate", "dateApplied", "date"],
  followUp: ["followUpDate", "followup", "follow_up"],
  contact: ["email", "contactEmail"],
  phone: ["mobile", "phoneNumber"],
  workMode: ["work_mode", "workmode"],
  rejectReason: ["rejectionReason", "rejection_reason"],
};

const fields = ["company", "role", "source", "location", "applied", "status", "followUp", "contact", "phone", "link", "notes", "rejectReason", "salary", "workMode"];

function readValue(record: JsonRecord, key: string): unknown {
  if (key in record) return record[key];
  return aliases[key]?.map((alias) => record[alias]).find((value) => value !== undefined);
}

function normalizeRecord(value: unknown): ImportItem | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as JsonRecord;
  return Object.fromEntries(
    fields
      .map((key) => [key, readValue(record, key)] as const)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, item == null ? "" : String(item).trim()]),
  );
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validate(item: ImportItem): string | null {
  if (!item.company) return "Company is required";
  if (!item.applied || !validDate(item.applied)) return "Applied must use YYYY-MM-DD format";
  if (item.followUp && !validDate(item.followUp)) return "Follow-up must use YYYY-MM-DD format";
  if (item.status && !(STATUSES as readonly string[]).includes(item.status)) return "Invalid status";
  if (item.source && !(SOURCES as readonly string[]).includes(item.source)) return "Invalid source";
  if (item.workMode && !(WORK_MODES as readonly string[]).includes(item.workMode)) return "Invalid work mode";
  if (item.status === "Rejected" && !item.rejectReason) return "Reason for rejection is required";
  if (item.link && !/^https?:\/\/\S+$/i.test(item.link)) return "Link must start with http:// or https://";
  return null;
}

function parseInput(raw: string) {
  if (!raw.trim()) return { items: [] as ImportItem[], errors: [] as PreviewError[], parseError: "Paste a JSON object or array to continue." };
  try {
    const parsed: unknown = JSON.parse(raw);
    const values: unknown[] = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as JsonRecord).items)
        ? (parsed as JsonRecord).items as unknown[]
        : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as JsonRecord).applications)
          ? (parsed as JsonRecord).applications as unknown[]
          : [parsed];
    if (values.length === 0) return { items: [], errors: [], parseError: "The JSON array is empty." };
    if (values.length > 500) return { items: [], errors: [], parseError: "You can import up to 500 applications at a time." };

    const errors: PreviewError[] = [];
    const items: ImportItem[] = [];
    const seen = new Set<string>();
    values.forEach((value, index) => {
      const item = normalizeRecord(value);
      if (!item) {
        errors.push({ index, message: "Each item must be a JSON object" });
        return;
      }
      const error = validate(item);
      if (error) {
        errors.push({ index, message: error });
        return;
      }
      const key = `${item.company.toLowerCase()}|${(item.role || "").toLowerCase()}|${item.applied}`;
      if (seen.has(key)) {
        errors.push({ index, message: "Duplicate in this JSON" });
        return;
      }
      seen.add(key);
      items.push(item);
    });
    return { items, errors, parseError: "" };
  } catch {
    return { items: [], errors: [], parseError: "Invalid JSON. Check commas, quotes, and brackets." };
  }
}

export function JsonImportModal({ open, onClose, onImported }: Props) {
  const [raw, setRaw] = useState("");
  const [requestError, setRequestError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => parseInput(raw), [raw]);

  function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => setRequestError("Could not read that file.");
    reader.readAsText(file);
    event.target.value = "";
  }

  async function importJson() {
    if (parsed.items.length === 0 || importing) return;
    setImporting(true);
    setRequestError("");
    try {
      const result = (await apiRequest("POST", "/api/applications/import", { items: parsed.items })) as ImportResult;
      onImported(result);
      setRaw("");
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Could not import applications.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Quick add JSON" description="Import one application object or a bulk JSON array." xwide>
      <div className="flex min-h-0 flex-col gap-4 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-muted">Use ISO dates such as <code className="rounded bg-subtle px-1.5 py-0.5 text-xs text-fg">2026-11-01</code>. Unknown fields are ignored.</p>
          <>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={loadFile} className="hidden" />
            <Button type="button" onClick={() => fileRef.current?.click()}><Upload className="size-3.5" />Choose JSON file</Button>
          </>
        </div>
        <Textarea
          value={raw}
          onChange={(event) => { setRaw(event.target.value); setRequestError(""); }}
          placeholder={'[{\n  "company": "Acme Inc",\n  "role": "Frontend Developer",\n  "applied": "2026-11-01",\n  "status": "Applied"\n}]'}
          className="min-h-[220px] font-mono text-xs"
          aria-label="Application JSON"
          spellCheck={false}
        />
        <div className="rounded-lg border border-line bg-subtle/40 p-3 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-fg"><Document className="mr-1 inline size-3.5" />Import preview</span>
            <span className="text-muted">{parsed.items.length} ready{parsed.errors.length ? ` · ${parsed.errors.length} issue${parsed.errors.length === 1 ? "" : "s"}` : ""}</span>
          </div>
          {parsed.parseError ? <p className="mt-2 text-status-rejected">{parsed.parseError}</p> : parsed.items.length > 0 ? (
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto text-muted">
              {parsed.items.slice(0, 6).map((item, index) => <div key={`${item.company}-${index}`} className="flex justify-between gap-3"><span className="truncate text-fg">{item.company}</span><span className="shrink-0">{item.status || "Applied"}</span></div>)}
              {parsed.items.length > 6 && <div>…and {parsed.items.length - 6} more</div>}
            </div>
          ) : null}
          {parsed.errors.length > 0 && <div className="mt-2 space-y-1 text-status-rejected">{parsed.errors.slice(0, 4).map((item) => <div key={item.index}>Row {item.index + 1}: {item.message}</div>)}{parsed.errors.length > 4 && <div>…and {parsed.errors.length - 4} more issues</div>}</div>}
        </div>
        {requestError && <p role="alert" className="text-sm text-status-rejected">{requestError}</p>}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="primary" disabled={parsed.items.length === 0 || importing} onClick={() => void importJson()}>{importing ? "Importing…" : `Import ${parsed.items.length} application${parsed.items.length === 1 ? "" : "s"}`}</Button>
        </div>
      </div>
    </Modal>
  );
}
