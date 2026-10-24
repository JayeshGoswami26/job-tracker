"use client";

import { useState, type ReactNode } from "react";
import { fmt } from "@/lib/date";
import { dueLabel, dueState, isEmail, isLikelyUrl, normalizeUrl } from "@/lib/status";
import type { App } from "@/lib/types";
import { Button } from "./ui/Button";
import { ExternalLink, Mail } from "./ui/icons";
import { StatusPill } from "./ui/StatusPill";

type Props = {
  app: App;
  onEdit: () => void;
  onDelete: (a: App) => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">{title}</h4>
      {children}
    </section>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-fg">{children}</dd>
    </div>
  );
}

const dash = <span className="text-muted">—</span>;

/** Read-only, categorized view of one application, shown when a row is clicked. */
export function ApplicationDetails({ app, onEdit, onDelete }: Props) {
  const [delArmed, setDelArmed] = useState(false);
  const due = dueState(app);
  const linkOk = isLikelyUrl(app.link);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg leading-snug font-semibold break-words text-fg">{app.company}</h3>
            <p className="mt-0.5 text-sm break-words text-muted">
              {app.role || <span className="italic">No role noted</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {app.workMode && (
              <span className="rounded-full border border-line bg-subtle px-2.5 py-1 text-xs font-medium text-muted">
                {app.workMode}
              </span>
            )}
            <StatusPill status={app.status} className="text-sm" />
          </div>
        </header>

        <Section title="Application">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 sm:grid-cols-3">
            <Fact label="Applied on">{app.applied ? fmt(app.applied) : dash}</Fact>
            <Fact label="Via">{app.source || dash}</Fact>
            <Fact label="Location">{app.location || dash}</Fact>
            <Fact label="Work mode">{app.workMode || dash}</Fact>
            <Fact label="Salary">{app.salary || dash}</Fact>
            <Fact label="Follow-up">
              {app.followUp ? (
                <>
                  {fmt(app.followUp)}
                  {due && <span className="ml-1.5 text-xs font-medium text-overdue">{dueLabel(due, app)}</span>}
                </>
              ) : due ? (
                <span className="font-medium text-overdue">{dueLabel(due, app)}</span>
              ) : (
                dash
              )}
            </Fact>
          </dl>
        </Section>

        {(app.contact || linkOk) && (
          <Section title="Contact">
            <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {app.contact && (
                <Fact label="Contact">
                  {isEmail(app.contact) ? (
                    <a
                      href={`mailto:${app.contact.trim()}`}
                      className="inline-flex items-center gap-1.5 text-accent hover:underline"
                    >
                      <Mail className="size-3.5 shrink-0" />
                      {app.contact}
                    </a>
                  ) : (
                    app.contact
                  )}
                </Fact>
              )}
              {linkOk && (
                <Fact label="Job link">
                  <a
                    href={normalizeUrl(app.link)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 break-all text-accent hover:underline"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {app.link.replace(/^https?:\/\//, "")}
                  </a>
                </Fact>
              )}
            </dl>
          </Section>
        )}

        {app.status === "Rejected" && app.rejectReason && (
          <Section title="Rejection">
            <p className="rounded-lg border border-line bg-subtle px-3.5 py-2.5 text-sm break-words text-fg">
              {app.rejectReason}
            </p>
          </Section>
        )}

        <Section title="Notes">
          {app.notes ? (
            <p className="rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed break-words whitespace-pre-wrap text-fg">
              {app.notes}
            </p>
          ) : (
            <p className="text-sm text-muted italic">No notes yet.</p>
          )}
        </Section>
      </div>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-line px-5 py-3.5">
        <Button
          variant={delArmed ? "confirm" : "danger"}
          onClick={() => {
            if (!delArmed) return setDelArmed(true);
            onDelete(app);
          }}
        >
          {delArmed ? "Confirm delete" : "Delete"}
        </Button>
        <div className="ml-auto flex gap-2">
          <Button variant="primary" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </footer>
    </div>
  );
}
