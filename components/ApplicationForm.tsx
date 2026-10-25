"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { FOLLOW_DAYS, addDays, fmt, today } from "@/lib/date";
import { normalizeCompany } from "@/lib/status";
import { SOURCES, STATUSES, WORK_MODES, type App, type Draft, type Status } from "@/lib/types";
import { Button } from "./ui/Button";
import { DatePicker } from "./ui/DatePicker";
import { Field } from "./ui/Field";
import { FieldShell } from "./ui/FieldShell";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import {
  Briefcase,
  Building,
  Calendar,
  Chat,
  Document,
  Home,
  IdCard,
  Lines,
  Link,
  ListStatus,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash,
} from "./ui/icons";

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
    phone: a.phone,
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
    phone: "",
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

/** Card with a bordered icon tile and title; fields flow into a grid below. */
function FormSection({
  icon,
  title,
  description,
  columns = 2,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-subtle/50 p-5">
      <header className="flex items-center gap-4">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tile text-tile-fg">
          {icon}
        </span>
        <div className="min-w-0">
          <h4 className="text-[17px] font-semibold text-fg">{title}</h4>
          <p className="text-[15px] text-muted">{description}</p>
        </div>
      </header>
      <div className={columns === 3 ? "mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-3" : "mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2"}>
        {children}
      </div>
    </section>
  );
}

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

  // O(1) hash map index for company duplicates built once on mount/data change
  const companyIndex = useMemo(() => {
    const map = new Map<string, App>();
    for (let i = 0; i < existing.length; i++) {
      const a = existing[i];
      if (a.id !== editing?.id) {
        const norm = normalizeCompany(a.company);
        if (norm && !map.has(norm)) {
          map.set(norm, a);
        }
      }
    }
    return map;
  }, [existing, editing?.id]);

  const duplicate = useMemo(() => {
    const q = normalizeCompany(form.company);
    if (q.length < 2) return null;
    return companyIndex.get(q) ?? null;
  }, [form.company, companyIndex]);

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
      phone: form.phone.trim(),
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
      <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-5 pb-6">
        <FormSection icon={<Briefcase className="size-5" />} title="Role" description="Company and job details">
          <Field
            label="Company"
            hint={
              duplicate ? (
                <span className="text-status-followed">
                  Already tracking: {duplicate.role || "applied"} · {duplicate.status} · applied {fmt(duplicate.applied)}
                </span>
              ) : undefined
            }
          >
            <Input
              icon={<Building className="size-4" />}
              required
              autoFocus={!focusReason}
              value={form.company}
              onChange={(e) => setField("company", e.target.value)}
              placeholder="Enter company name"
            />
          </Field>
          <Field label="Role title">
            <Input
              icon={<Briefcase className="size-4" />}
              placeholder="e.g. MERN Stack Developer"
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection
          icon={<Document className="size-5" />}
          title="Application"
          description="Application status and important dates"
          columns={3}
        >
          <Field label="Job link" full hint="https:// added automatically if omitted">
            <Input
              icon={<Link className="size-4" />}
              inputMode="url"
              placeholder="linkedin.com/jobs/…"
              value={form.link}
              onChange={(e) => setField("link", e.target.value)}
            />
          </Field>
          <Field label="Applied via">
            <Select
              icon={<Mail className="size-4" />}
              value={form.source}
              options={SOURCE_OPTIONS}
              onChange={(v) => setField("source", v)}
              ariaLabel="Applied via"
              className="w-full"
            />
          </Field>
          <Field label="Status">
            <Select
              icon={<ListStatus className="size-4" />}
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(v) => setField("status", v as Status)}
              ariaLabel="Status"
              className="w-full"
            />
          </Field>
          <Field label="Date applied">
            <DatePicker
              icon={<Calendar className="size-4" />}
              value={form.applied}
              ariaLabel="Date applied"
              onChange={(value) => {
                setForm((f) => ({ ...f, applied: value, followUp: editing ? f.followUp : addDays(value, FOLLOW_DAYS) }));
              }}
            />
          </Field>
          <Field label="Follow-up date" hint={editing ? undefined : "Auto-set a week after applying"}>
            <DatePicker
              icon={<Calendar className="size-4" />}
              value={form.followUp}
              ariaLabel="Follow-up date"
              onChange={(value) => setField("followUp", value)}
            />
          </Field>
          {form.status === "Rejected" && (
            <Field label="Reason for rejection" full>
              <Input
                icon={<Lines className="size-4" />}
                autoFocus={focusReason}
                placeholder="e.g. Required 3+ years of ASP.NET"
                value={form.rejectReason}
                onChange={(e) => setField("rejectReason", e.target.value)}
              />
            </Field>
          )}
        </FormSection>

        <FormSection icon={<MapPin className="size-5" />} title="Details" description="Location, work mode and expected salary" columns={3}>
          <Field label="Location">
            <Input
              icon={<MapPin className="size-4" />}
              placeholder="e.g. Indore or Remote"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </Field>
          <Field label="Work mode">
            <Select
              icon={<Home className="size-4" />}
              value={form.workMode}
              options={WORK_MODE_OPTIONS}
              onChange={(v) => setField("workMode", v)}
              ariaLabel="Work mode"
              className="w-full"
            />
          </Field>
          <Field label="Salary expectation">
            <Input
              icon={<span className="text-sm font-medium">₹</span>}
              placeholder="e.g. 15-18 LPA"
              value={form.salary}
              onChange={(e) => setField("salary", e.target.value)}
            />
          </Field>
        </FormSection>

        <FormSection icon={<IdCard className="size-5" />} title="Contact" description="Your contact information for this application">
          <Field label="Email or person">
            <Input
              icon={<Mail className="size-4" />}
              value={form.contact}
              onChange={(e) => setField("contact", e.target.value)}
              placeholder="e.g. priya@company.com"
            />
          </Field>
          <Field label="Mobile number">
            <Input
              icon={<Phone className="size-4" />}
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="e.g. 98765 43210"
            />
          </Field>
        </FormSection>

        <FormSection icon={<Lines className="size-5" />} title="Notes" description="Additional notes about this application">
          <Field label="Notes" full>
            <FieldShell icon={<Lines className="size-4" />}>
              <textarea
                rows={4}
                placeholder="What they said, next steps, interview times"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="min-h-24 min-w-0 flex-1 resize-y bg-transparent px-3 py-2.5 text-sm leading-relaxed text-fg placeholder:text-muted/60 focus:outline-none"
              />
            </FieldShell>
          </Field>
          {editing && (
            <Field label="Add a note" full hint="Appended to Notes with today's date on save">
              <Input
                icon={<Chat className="size-4" />}
                placeholder="e.g. HR asked for a call tomorrow"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
              />
            </Field>
          )}
        </FormSection>

        {error && <p className="px-1 text-sm font-medium text-status-rejected">{error}</p>}
      </div>
      <footer className="flex flex-wrap justify-between gap-3 px-6 pt-2 pb-6">
        {editing ? (
          <Button
            size="lg"
            variant={delArmed ? "confirm" : "danger"}
            onClick={() => {
              if (!delArmed) return setDelArmed(true);
              onDelete?.(editing);
            }}
          >
            <Trash className="size-4" />
            {delArmed ? "Confirm delete" : "Delete"}
          </Button>
        ) : (
          <span />
        )}
        <div className="ml-auto flex gap-3">
          <Button size="lg" variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="lg" variant="primary" type="submit" disabled={saving}>
            <Save className="size-4" />
            {saving ? "Saving…" : editing ? "Save changes" : "Save application"}
          </Button>
        </div>
      </footer>
    </form>
  );
}
