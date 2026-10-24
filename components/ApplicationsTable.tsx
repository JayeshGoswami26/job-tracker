import { cn } from "@/lib/cn";
import { fmt } from "@/lib/date";
import { ACTIVE, dueState, isEmail, isLikelyUrl, normalizeUrl } from "@/lib/status";
import { STATUSES, type App, type Status } from "@/lib/types";
import { Empty } from "./ui/Empty";
import { ExternalLink, Mail } from "./ui/icons";
import { Select } from "./ui/Select";
import { StatusPill } from "./ui/StatusPill";

type Props = {
  apps: App[];
  onOpen: (a: App) => void;
  onStatusChange: (a: App, status: Status) => void;
};

const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s, label: s }));

const th = "border-b border-line bg-subtle px-4 py-3 text-left text-[11.5px] font-semibold tracking-[0.07em] text-muted uppercase";
const td = "px-4 py-3 align-middle text-sm";

export function ApplicationsTable({ apps, onOpen, onStatusChange }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface max-md:border-0 max-md:bg-transparent">
      <div className="overflow-x-auto max-md:overflow-visible">
        <table className="jt-table w-full min-w-[880px] border-collapse max-md:min-w-0">
          <thead>
            <tr>
              <th className={th}>Company</th>
              <th className={cn(th, "jt-hide")}>Via</th>
              <th className={cn(th, "jt-hide")}>Applied</th>
              <th className={th}>Status</th>
              <th className={cn(th, "jt-hide")}>Follow up</th>
              <th className={cn(th, "jt-hide")}>Salary</th>
              <th className={cn(th, "jt-hide")}>Contact</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted">
                  No applications match this filter.
                </td>
              </tr>
            ) : (
              apps.map((a) => {
                const due = dueState(a);
                const fu = ACTIVE.has(a.status) ? fmt(a.followUp) : "—";
                const linkOk = isLikelyUrl(a.link);
                return (
                  <tr
                    key={a.id}
                    tabIndex={0}
                    onClick={() => onOpen(a)}
                    onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onOpen(a)}
                    className="cursor-pointer border-b border-line last:border-b-0 hover:bg-subtle max-md:mb-0 max-md:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <td className={cn(td, "jt-co")}>
                      <span className="flex flex-wrap items-center gap-x-1.5 font-semibold">
                        {a.company}
                        {due && <span className="inline-block size-1.5 rounded-full bg-overdue" title="Follow-up overdue or missing" />}
                        {linkOk && (
                          <a
                            href={normalizeUrl(a.link)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open job link for ${a.company}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted transition-colors hover:text-fg"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </span>
                      <small className="block text-[13px] break-words text-muted">
                        {a.role}
                        {a.location ? ` · ${a.location}` : ""}
                        {a.workMode ? ` · ${a.workMode}` : ""}
                      </small>
                      {a.status === "Rejected" && a.rejectReason && (
                        <small className="block text-[13px] text-muted">Reason: {a.rejectReason}</small>
                      )}
                    </td>
                    <td className={cn(td, "jt-hide", "text-[13px] text-muted")}>{a.source || "—"}</td>
                    <td className={cn(td, "jt-hide", "font-mono text-[13px] whitespace-nowrap tabular-nums")}>{fmt(a.applied)}</td>
                    <td className={cn(td, "jt-status")}>
                      <Select
                        value={a.status}
                        options={STATUS_OPTIONS}
                        onChange={(v) => onStatusChange(a, v as Status)}
                        ariaLabel={`Change status for ${a.company}`}
                        className="rounded-full border border-transparent px-2 py-1 hover:border-line hover:bg-subtle"
                        renderValue={() => <StatusPill status={a.status} />}
                      />
                    </td>
                    <td
                      className={cn(
                        td,
                        "jt-hide",
                        "font-mono text-[13px] whitespace-nowrap tabular-nums",
                        due === "over" || due === "missing" ? "font-semibold text-overdue" : due === "today" ? "font-semibold text-status-followed" : "",
                      )}
                    >
                      {due === "missing" ? "not set" : fu}
                    </td>
                    <td className={cn(td, "jt-hide", "font-mono text-[13px] whitespace-nowrap text-muted tabular-nums")}>
                      {a.salary || "—"}
                    </td>
                    <td className={cn(td, "jt-hide", "max-w-[200px] text-[13px] break-words text-muted")}>
                      {isEmail(a.contact) ? (
                        <a
                          href={`mailto:${a.contact.trim()}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 transition-colors hover:text-fg"
                        >
                          <Mail className="size-3.5 shrink-0" />
                          {a.contact}
                        </a>
                      ) : (
                        a.contact || "—"
                      )}
                    </td>
                    <td className="jt-meta">
                      <span>{a.source}</span>
                      <span>Applied {fmt(a.applied)}</span>
                      <span>Follow up {due === "missing" ? "not set" : fu}</span>
                      {a.salary && <span>{a.salary}</span>}
                      {a.workMode && <span>{a.workMode}</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TableEmptyState({ loaded, total }: { loaded: boolean; total: number }) {
  if (!loaded) return <Empty>Loading applications…</Empty>;
  if (total === 0)
    return (
      <Empty>
        No applications yet. Use &quot;Add application&quot; each time you email a company or apply on a job site.
      </Empty>
    );
  return null;
}
