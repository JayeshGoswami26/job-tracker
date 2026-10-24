"use client";

import { useState, type ReactNode } from "react";
import { fmt } from "@/lib/date";
import { dueLabel, dueState, isEmail, isLikelyUrl, normalizeUrl } from "@/lib/status";
import type { App } from "@/lib/types";
import { Button } from "./ui/Button";
import { Building, Calendar, ExternalLink, Lines, Link, Mail, MapPin, Pencil, Phone, Trash, User, XCircle } from "./ui/icons";
import { StatusPill } from "./ui/StatusPill";

type Props = {
  app: App;
  onEdit: () => void;
  onDelete: (a: App) => void;
};

/** Titled card with an icon tile; the optional `aside` sits at the right of the header. */
function DetailCard({
  icon,
  title,
  description,
  aside,
  tone = "tile",
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  aside?: ReactNode;
  tone?: "tile" | "danger";
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-subtle/50 p-5">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={
            tone === "danger"
              ? "flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400"
              : "flex size-12 shrink-0 items-center justify-center rounded-xl bg-tile text-tile-fg"
          }
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h4 className="text-[13.6px] font-semibold text-fg">{title}</h4>
          <p className="text-[12px] text-muted">{description}</p>
        </div>
        {aside && <div className="ml-auto flex items-center">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/** Read-only value in the same bordered, icon-prefixed box the edit form uses. */
function ReadField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="mb-2 block text-[12px] text-fg/85">{label}</span>
      <div className="flex min-h-12 items-stretch rounded-lg border border-line bg-surface">
        <span aria-hidden="true" className="flex w-12 shrink-0 items-center justify-center border-r border-line text-muted">
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2.5 text-[12px] break-words text-fg">{children}</div>
      </div>
    </div>
  );
}

const dash = <span className="text-muted">—</span>;

/** Read-only, categorized view of one application, shown when a row is clicked. */
export function ApplicationDetails({ app, onEdit, onDelete }: Props) {
  const [delArmed, setDelArmed] = useState(false);
  const due = dueState(app);
  const linkOk = isLikelyUrl(app.link);
  const initial = app.company.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-5 pb-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            <span
              aria-hidden="true"
              className="flex size-[68.8px] shrink-0 items-center justify-center rounded-2xl bg-white text-[32px] font-bold text-[#090c12]"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <h3 className="flex flex-wrap items-center gap-2.5 text-[19.2px] leading-tight font-semibold break-words text-fg">
                {app.company}
                {linkOk && (
                  <a
                    href={normalizeUrl(app.link)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open job link for ${app.company}`}
                    className="text-muted hover:text-fg"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </h3>
              <p className="mt-1.5 text-[12.8px] break-words text-muted">
                {app.role || <span className="italic">No role noted</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {app.workMode && (
              <span className="inline-flex h-[29.6px] items-center gap-2 rounded-lg border border-line bg-subtle px-3.5 text-[12px] font-medium text-fg">
                <Building className="size-4 text-muted" />
                {app.workMode}
              </span>
            )}
            <StatusPill status={app.status} />
          </div>
        </header>

        <DetailCard
          icon={<Calendar className="size-5" />}
          title="Application"
          description="Key application information"
          aside={
            app.applied ? (
              <span className="inline-flex items-center gap-2 text-[12px] text-muted">
                <Calendar className="size-4" />
                Applied <b className="font-semibold text-fg">{fmt(app.applied)}</b>
              </span>
            ) : undefined
          }
        >
          <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-3">
            <ReadField label="Applied on" icon={<Calendar className="size-4" />}>
              {app.applied ? fmt(app.applied) : dash}
            </ReadField>
            <ReadField label="Via" icon={<Mail className="size-4" />}>
              {app.source || dash}
            </ReadField>
            <ReadField label="Location" icon={<MapPin className="size-4" />}>
              {app.location || dash}
            </ReadField>
            <ReadField label="Work mode" icon={<Building className="size-4" />}>
              {app.workMode || dash}
            </ReadField>
            <ReadField label="Salary" icon={<span className="text-[12px] font-medium">₹</span>}>
              {app.salary || dash}
            </ReadField>
            <ReadField label="Follow-up" icon={<Calendar className="size-4" />}>
              {app.followUp ? (
                <>
                  {fmt(app.followUp)}
                  {due && <span className="text-[10.4px] font-medium text-overdue">{dueLabel(due, app)}</span>}
                </>
              ) : due ? (
                <span className="font-medium text-overdue">{dueLabel(due, app)}</span>
              ) : (
                dash
              )}
            </ReadField>
          </div>
        </DetailCard>

        {(app.contact || app.phone || linkOk) && (
          <DetailCard icon={<User className="size-5" />} title="Contact" description="Contact details and useful links">
            <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {app.contact && (
                <ReadField label="Contact email" icon={<Mail className="size-4" />}>
                  {isEmail(app.contact) ? (
                    <a href={`mailto:${app.contact.trim()}`} className="min-w-0 break-all hover:underline">
                      {app.contact}
                    </a>
                  ) : (
                    <span className="break-all">{app.contact}</span>
                  )}
                </ReadField>
              )}
              {app.phone && (
                <ReadField label="Mobile number" icon={<Phone className="size-4" />}>
                  <a href={`tel:${app.phone.replace(/[^+\d]/g, "")}`} className="hover:underline">
                    {app.phone}
                  </a>
                </ReadField>
              )}
              {linkOk && (
                <ReadField label="Job link" icon={<Link className="size-4" />}>
                  <a
                    href={normalizeUrl(app.link)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 break-all hover:underline"
                  >
                    {app.link.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-4 shrink-0 text-muted" />
                  </a>
                </ReadField>
              )}
            </div>
          </DetailCard>
        )}

        {app.status === "Rejected" && app.rejectReason && (
          <DetailCard
            icon={<XCircle className="size-5" />}
            title="Rejection"
            description="Reason for rejection (if provided)"
            tone="danger"
          >
            <p className="mt-5 rounded-lg border border-line bg-surface px-4 py-3.5 text-[12px] leading-relaxed break-words text-fg">
              {app.rejectReason}
            </p>
          </DetailCard>
        )}

        <DetailCard icon={<Lines className="size-5" />} title="Notes" description="Additional notes about this application">
          {app.notes ? (
            <p className="mt-5 rounded-lg border border-line bg-surface px-4 py-3.5 text-[12px] leading-relaxed break-words whitespace-pre-wrap text-fg">
              {app.notes}
            </p>
          ) : (
            <p className="mt-5 text-[12px] text-muted italic">No notes yet.</p>
          )}
        </DetailCard>

        <footer className="flex flex-wrap justify-between gap-3 pt-2">
          <Button
            size="lg"
            variant={delArmed ? "confirm" : "danger"}
            onClick={() => {
              if (!delArmed) return setDelArmed(true);
              onDelete(app);
            }}
          >
            <Trash className="size-4" />
            {delArmed ? "Confirm delete" : "Delete"}
          </Button>
          <Button size="lg" variant="primary" onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </footer>
      </div>
    </div>
  );
}
