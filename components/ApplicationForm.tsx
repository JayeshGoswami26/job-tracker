"use client";

import { useMemo, useState, type FormEvent } from "react";
import { FOLLOW_DAYS, addDays, fmt, today } from "@/lib/date";
import { normalizeCompany } from "@/lib/status";
import { SOURCES, STATUSES, WORK_MODES, type App, type Draft, type Status } from "@/lib/types";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";

type Props = {
  editing: App | null;
  /** Status preselected before the sheet opened (e.g. "Rejected" from the row dropdown). */
  presetStatus?: Status;
  focusReason?: boolean;
  /** Existing applications for the duplicate-company hint. */
  existing: App[];
  onSave: (data: Draft) => Promise<boolean>;
  onDelete?: (a: App) => void;
  onCancel: () => void;
};

function toDraft(a: App): Draft {
  return {
    company: a.company,
    role: a.role,
    source: a.source,
    location: a.location,
    applied: a.applied,
    status: a.status,
    followUp: a.followUp,
    contact: a.contact,
    link: a.link,
    notes: a.notes,
    rejectReason: a.rejectReason,
    salary: a.salary,
    workMode: a.workMode,
  };
}

function blankDraft(): Draft {
  const t = today();
  return {
    company: "",
    role: "",
    source: "Email",
    location: "",
    applied: t,
    status: "Applied",
    followUp: addDays(t, FOLLOW_DAYS),
    contact: "",
    link: "",
    notes: "",
    rejectReason: "",
    salary: "",
    workMode: "",
  };
}

const WORK_MODE_OPTIONS = [{ value: "", label: "Not set" }, ...WORK_MODES.map((w) => ({ value: w, label: w }))];
const SOURCE_OPTIONS = SOURCES.map((s) => ({ value: s, label: s }));
const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s, label: s }));

export function ApplicationForm({ editing, presetStatus, focusReason, existing, onSave, onDelete, onCancel }: Props) {
  const [form, setForm] = useState<Draft>(() => {
    const base = editing ? toDraft(editing) : blankDraft();
    if (presetStatus) base.status = presetStatus;
    return base;
  });
  const [addNote, setAddNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [delArmed, setDelArmed] = useState(false);
  const [error, setError] = useState("");

  const duplicate = useMemo(() => {
    const q = normalizeCompany(form.company);
    if (q.length < 2) return null;
    return existing.find((a) => a.id !== editing?.id && normalizeCompany(a.company) === q) ?? null;
  }, [form.company, existing, editing]);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError("");

    const data: Draft = {
      ...form,
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      contact: form.contact.trim(),
      link: form.link.trim(),
      notes: form.notes.trim(),
      rejectReason: form.rejectReason.trim(),
      salary: form.salary.trim(),
    };
    if (!data.company) return setError("Add the company name");
    if (!data.applied) return setError("Add the date you applied");
    if (data.status === "Rejected" && !data.rejectReason) return setError("Add the reason for rejection");
    if (data.status !== "Rejected") data.rejectReason = "";

    const note = addNote.trim();
    if (editing && note) {
      const stamp = `[${fmt(today())}] ${note}`;
      data.notes = data.notes ? `${data.notes}\n${stamp}` : stamp;
    }

    setSaving(true);
    const ok = await onSave(data);
    setSaving(false);
    if (!ok) setError("Could not save — check the connection and try again.");
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-col">
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2">
        <Field
          label="Company"
          full
          hint={
            duplicate ? (
              <span className="text-status-followed">
                Already tracking: {duplicate.role || "applied"} · {duplicate.status} · applied {fmt(duplicate.applied)}
              </span>
            ) : undefined
          }
        >
          <Input
            required
            autoFocus={!focusReason}
            value={form.company}
            onChange={(e) => setField("company", e.target.value)}
            placeholder="e.g. Zomato"
          />
        </Field>
        <Field label="Role" full>
          <Input
            placeholder="e.g. MERN Stack Developer"
            value={form.role}
            onChange={(e) => setField("role", e.target.value)}
          />
        </Field>
        <Field label="Applied via">
          <Select
            value={form.source}
            options={SOURCE_OPTIONS}
            onChange={(v) => setField("source", v)}
            ariaLabel="Applied via"
            className="w-full justify-between border border-line bg-surface px-3 py-2 hover:bg-subtle"
          />
        </Field>
        <Field label="Work mode">
          <Select
            value={form.workMode}
            options={WORK_MODE_OPTIONS}
            onChange={(v) => setField("workMode", v)}
            ariaLabel="Work mode"
            className="w-full justify-between border border-line bg-surface px-3 py-2 hover:bg-subtle"
          />
        </Field>
        <Field label="Date applied">
          <Input
            type="date"
            required
            value={form.applied}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, applied: v, followUp: editing ? f.followUp : addDays(v, FOLLOW_DAYS) }));
            }}
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            options={STATUS_OPTIONS}
            onChange={(v) => setField("status", v as Status)}
            ariaLabel="Status"
            className="w-full justify-between border border-line bg-surface px-3 py-2 hover:bg-subtle"
          />
        </Field>
        {form.status === "Rejected" && (
          <Field label="Reason for rejection" full>
            <Input
              autoFocus={focusReason}
              placeholder="e.g. Required 3+ years of ASP.NET"
              value={form.rejectReason}
              onChange={(e) => setField("rejectReason", e.target.value)}
            />
          </Field>
        )}
        <Field label="Follow-up date" hint={editing ? undefined : "Auto-set a week after applying"}>
          <Input type="date" value={form.followUp} onChange={(e) => setField("followUp", e.target.value)} />
        </Field>
        <Field label="Contact email or person">
          <Input value={form.contact} onChange={(e) => setField("contact", e.target.value)} placeholder="e.g. priya@company.com" />
        </Field>
        <Field label="Location">
          <Input placeholder="e.g. Indore or Remote" value={form.location} onChange={(e) => setField("location", e.target.value)} />
        </Field>
        <Field label="Salary expectation">
          <Input placeholder="e.g. 15-18 LPA" value={form.salary} onChange={(e) => setField("salary", e.target.value)} />
        </Field>
        <Field label="Job link" full hint="https:// added automatically if omitted">
          <Input
            inputMode="url"
            placeholder="https:// or linkedin.com/jobs/…"
            value={form.link}
            onChange={(e) => setField("link", e.target.value)}
          />
        </Field>
        <Field label="Notes" full>
          <Textarea
            rows={4}
            placeholder="What they said, next steps, interview times"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </Field>
        {editing && (
          <Field label="Add a note" full hint="Appended to Notes with today's date on save">
            <Input
              placeholder="e.g. HR asked for a call tomorrow"
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
            />
          </Field>
        )}
        {error && <p className="text-[13px] font-medium text-status-rejected sm:col-span-2">{error}</p>}
      </div>
      <footer className="flex flex-wrap justify-between gap-2 border-t border-line px-5 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom,0px))]">
        {editing ? (
          <Button
            variant={delArmed ? "confirm" : "danger"}
            onClick={() => {
              if (!delArmed) return setDelArmed(true);
              onDelete?.(editing);
            }}
          >
            {delArmed ? "Confirm delete" : "Delete"}
          </Button>
        ) : (
          <span />
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="quiet" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </footer>
    </form>
  );
}
