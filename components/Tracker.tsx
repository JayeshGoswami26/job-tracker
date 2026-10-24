"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SOURCES, STATUSES, type App, type Draft, type Status } from "@/lib/types";

const ACTIVE = new Set<Status>(["Applied", "Followed up"]);
const FOLLOW_DAYS = 7;

function today(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function diffDays(iso: string): number {
  return Math.round((new Date(iso + "T00:00:00").getTime() - new Date(today() + "T00:00:00").getTime()) / 864e5);
}

function fmt(iso: string): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function cls(s: Status): string {
  return "s-" + s.split(" ")[0];
}

function dueState(a: App): "over" | "today" | null {
  if (!ACTIVE.has(a.status) || !a.followUp) return null;
  const d = diffDays(a.followUp);
  return d < 0 ? "over" : d === 0 ? "today" : null;
}

function matchesFilter(a: App, f: string): boolean {
  if (f === "All") return true;
  if (f === "Active") return ACTIVE.has(a.status) || a.status === "Interview";
  return a.status === f;
}

function blankDraft(): Draft {
  const t = today();
  return {
    company: "", role: "", source: "Email", location: "", applied: t, status: "Applied",
    followUp: addDays(t, FOLLOW_DAYS), contact: "", link: "", notes: "", rejectReason: "",
  };
}

function toDraft(a: App): Draft {
  return {
    company: a.company, role: a.role, source: a.source, location: a.location, applied: a.applied,
    status: a.status, followUp: a.followUp, contact: a.contact, link: a.link, notes: a.notes,
    rejectReason: a.rejectReason,
  };
}

async function request(method: "POST" | "PATCH" | "DELETE", url: string, body?: unknown): Promise<void> {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || "Request failed");
  }
}

export default function Tracker() {
  const [apps, setApps] = useState<App[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sheet, setSheet] = useState<{ editing: App | null } | null>(null);
  const [form, setForm] = useState<Draft>(blankDraft());
  const [delArmed, setDelArmed] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    window.setTimeout(() => setToastMsg(""), 2200);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/applications", { cache: "no-store" });
      if (!r.ok) throw new Error("load failed");
      setApps((await r.json()) as App[]);
      setLoadError("");
    } catch {
      setLoadError("Could not load applications. Check the server and reload.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheet(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const due = useMemo(
    () => apps.filter((a) => dueState(a) !== null).sort((a, b) => a.followUp.localeCompare(b.followUp)),
    [apps],
  );

  const list = useMemo(() => {
    const t = query.trim().toLowerCase();
    return apps
      .filter((a) => matchesFilter(a, statusFilter))
      .filter((a) => !sourceFilter || a.source === sourceFilter)
      .filter((a) => !t || [a.company, a.role, a.contact, a.notes, a.location].join(" ").toLowerCase().includes(t))
      .sort((a, b) => b.applied.localeCompare(a.applied));
  }, [apps, statusFilter, sourceFilter, query]);

  async function quick(id: string, patch: Partial<Draft>, msg: string) {
    try {
      await request("PATCH", `/api/applications/${id}`, patch);
      await load();
      toast(msg);
    } catch (e) {
      toast("Could not save: " + (e as Error).message);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied " + text);
    } catch {
      toast(text);
    }
  }

  function openSheet(a: App | null) {
    setForm(a ? toDraft(a) : blankDraft());
    setDelArmed(false);
    setSheet({ editing: a });
  }

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSave() {
    const data: Draft = {
      ...form,
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      contact: form.contact.trim(),
      link: form.link.trim(),
      notes: form.notes.trim(),
      rejectReason: form.rejectReason.trim(),
    };
    if (!data.company) return toast("Add the company name");
    if (!data.applied) return toast("Add the date you applied");
    if (data.status === "Rejected" && !data.rejectReason) return toast("Add the reason for rejection");
    if (data.status !== "Rejected") data.rejectReason = "";

    const editing = sheet?.editing ?? null;
    try {
      if (editing) await request("PATCH", `/api/applications/${editing.id}`, data);
      else await request("POST", "/api/applications", data);
      await load();
      toast(editing ? "Saved" : "Added " + data.company);
      setSheet(null);
    } catch (e) {
      toast("Could not save: " + (e as Error).message);
    }
  }

  async function onDelete() {
    const editing = sheet?.editing;
    if (!editing) return;
    if (!delArmed) {
      setDelArmed(true);
      return;
    }
    try {
      await request("DELETE", `/api/applications/${editing.id}`);
      await load();
      toast("Deleted " + editing.company);
      setSheet(null);
    } catch (e) {
      toast("Could not delete: " + (e as Error).message);
    }
  }

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Application Tracker</h1>
          <p className="sub">Companies you have applied to, and the follow-ups due.</p>
        </div>
        <button type="button" className="primary" onClick={() => openSheet(null)}>
          Add application
        </button>
      </header>

      {loadError && <div className="notice">{loadError}</div>}

      <section className="stats" aria-label="Summary">
        <div className={`stat ${due.length > 0 ? "alert" : ""}`}>
          <b>{due.length}</b>
          <span>Follow-ups due</span>
        </div>
        <div className="stat">
          <b>{apps.filter((a) => ACTIVE.has(a.status)).length}</b>
          <span>Waiting for reply</span>
        </div>
        <div className="stat">
          <b>{apps.filter((a) => a.status === "Interview").length}</b>
          <span>Interviews</span>
        </div>
        <div className="stat">
          <b>{apps.length}</b>
          <span>Total applied</span>
        </div>
      </section>

      <section>
        <h2>
          Follow up <span className="count">{due.length}</span>
        </h2>
        <div className="queue">
          {!loaded ? (
            <div className="empty">Loading applications…</div>
          ) : apps.length === 0 ? (
            <div className="empty">No applications yet. Use &quot;Add application&quot; each time you email a company or apply on a job site.</div>
          ) : due.length === 0 ? (
            <div className="empty">Nothing due. You are up to date.</div>
          ) : (
            due.map((a) => {
              const s = dueState(a);
              const d = diffDays(a.followUp);
              const label = s === "over" ? `${-d} day${d === -1 ? "" : "s"} overdue` : "Due today";
              return (
                <div key={a.id} className={`qitem ${s ?? ""}`}>
                  <div className="who">
                    <strong>{a.company}</strong>
                    <small>
                      {a.role}
                      {a.source ? ` · ${a.source}` : ""} · applied {fmt(a.applied)}
                    </small>
                  </div>
                  <span className="due-tag">{label}</span>
                  <div className="acts">
                    <button
                      type="button"
                      className="primary"
                      onClick={() =>
                        quick(a.id, { status: "Followed up", followUp: addDays(today(), FOLLOW_DAYS) }, "Marked followed up. Next check in 7 days.")
                      }
                    >
                      Mark followed up
                    </button>
                    {a.contact && (
                      <button type="button" onClick={() => copy(a.contact)}>
                        Copy contact
                      </button>
                    )}
                    <button type="button" className="quiet" onClick={() => quick(a.id, { status: "Closed", followUp: "" }, "Closed with no response")}>
                      No response, close
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section>
        <h2>
          All applications <span className="count">{list.length}</span>
        </h2>
        <div className="toolbar">
          <label className="search">
            <span style={{ position: "absolute", left: -9999 }}>Search</span>
            <input
              type="search"
              placeholder="Search company, role, contact or notes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} aria-label="Filter by source">
            <option value="">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="chips" role="group" aria-label="Filter by status">
          {["Active", "All", ...STATUSES].map((o) => (
            <button key={o} type="button" className="chip" aria-pressed={o === statusFilter} onClick={() => setStatusFilter(o)}>
              {o}
              <span className="n">{apps.filter((a) => matchesFilter(a, o)).length}</span>
            </button>
          ))}
        </div>
        <div className="ledger">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Via</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Follow up</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>
                      No applications match this filter.
                    </td>
                  </tr>
                ) : (
                  list.map((a) => {
                    const s = dueState(a);
                    const fu = ACTIVE.has(a.status) ? fmt(a.followUp) : "—";
                    return (
                      <tr key={a.id} tabIndex={0} onClick={() => openSheet(a)} onKeyDown={(e) => e.key === "Enter" && openSheet(a)}>
                        <td className="co">
                          <strong>{a.company}</strong>
                          <small>
                            {a.role}
                            {a.location ? ` · ${a.location}` : ""}
                          </small>
                          {a.status === "Rejected" && a.rejectReason && <small>Reason: {a.rejectReason}</small>}
                        </td>
                        <td className="hide-sm via">{a.source || "—"}</td>
                        <td className="hide-sm mono">{fmt(a.applied)}</td>
                        <td className="status">
                          <span className={`status-txt ${cls(a.status)}`}>{a.status}</span>
                        </td>
                        <td className={`hide-sm mono ${s ? (s === "over" ? "due-txt" : "today-txt") : ""}`}>{fu}</td>
                        <td className="hide-sm contact">{a.contact}</td>
                        <td className="meta">
                          <span>{a.source}</span>
                          <span>Applied {fmt(a.applied)}</span>
                          <span>Follow up {fu}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {sheet && (
        <>
          <div className="scrim" onClick={() => setSheet(null)} />
          <aside className="sheet" aria-labelledby="sheetTitle">
            <div className="hd">
              <h3 id="sheetTitle">{sheet.editing ? "Edit application" : "Add application"}</h3>
              <button type="button" className="quiet" onClick={() => setSheet(null)} aria-label="Close">
                Close
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSave();
              }}
            >
              <label className="full">
                Company
                <input required value={form.company} onChange={(e) => setField("company", e.target.value)} />
              </label>
              <label className="full">
                Role
                <input placeholder="e.g. MERN Stack Developer" value={form.role} onChange={(e) => setField("role", e.target.value)} />
              </label>
              <label>
                Applied via
                <select value={form.source} onChange={(e) => setField("source", e.target.value)}>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <input placeholder="e.g. Kochi or Remote" value={form.location} onChange={(e) => setField("location", e.target.value)} />
              </label>
              <label>
                Date applied
                <input
                  type="date"
                  required
                  value={form.applied}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({ ...f, applied: v, followUp: sheet.editing ? f.followUp : addDays(v, FOLLOW_DAYS) }));
                  }}
                />
              </label>
              <label>
                Status
                <select value={form.status} onChange={(e) => setField("status", e.target.value as Status)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              {form.status === "Rejected" && (
                <label className="full">
                  Reason for rejection
                  <input
                    placeholder="e.g. Required 3+ years of ASP.NET"
                    value={form.rejectReason}
                    onChange={(e) => setField("rejectReason", e.target.value)}
                  />
                </label>
              )}
              <label>
                Follow-up date
                <input type="date" value={form.followUp} onChange={(e) => setField("followUp", e.target.value)} />
              </label>
              <label>
                Contact email or person
                <input value={form.contact} onChange={(e) => setField("contact", e.target.value)} />
              </label>
              <label className="full">
                Job link
                <input type="url" placeholder="https://" value={form.link} onChange={(e) => setField("link", e.target.value)} />
              </label>
              <label className="full">
                Notes
                <textarea
                  rows={4}
                  placeholder="What they said, next steps, interview times"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </label>
            </form>
            <footer>
              {sheet.editing ? (
                <button type="button" className={delArmed ? "confirm" : "danger-btn"} onClick={onDelete}>
                  {delArmed ? "Confirm delete" : "Delete"}
                </button>
              ) : (
                <span />
              )}
              <div>
                <button type="button" onClick={() => setSheet(null)}>
                  Cancel
                </button>
                <button type="button" className="primary" onClick={onSave}>
                  Save
                </button>
              </div>
            </footer>
          </aside>
        </>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
