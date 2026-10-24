import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/date";
import { ACTIVE, dueState, isEmail, isLikelyUrl, normalizeUrl } from "@/lib/status";
import { STATUSES, type App, type Status } from "@/lib/types";
import { ExternalLink, Mail } from "./ui/icons";
import { Select } from "./ui/Select";
import { StatusPill } from "./ui/StatusPill";

type Props = {
  apps: App[];
  loaded: boolean;
  loading?: boolean;
  error?: string;
  emptyKind?: "database" | "filters";
  onOpen: (a: App) => void;
  onStatusChange: (a: App, status: Status) => void;
  onRetry?: () => void;
  onEmptyAction?: () => void;
};

const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s, label: s }));
const th = "border-b border-line bg-subtle/50 px-4 py-3 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase select-none whitespace-nowrap";
const td = "px-4 py-3.5 align-middle text-xs";
// NOTE: no <colgroup>/<col> here — styled col elements inside the streamed
// Suspense boundary stall React's hydration reveal on this Next version.

function SkeletonCell({ className }: { className?: string }) {
  return <span className={cn("block h-3 animate-pulse rounded bg-subtle", className)} />;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <tr key={`skeleton-${index}`} className="border-b border-line/60 last:border-b-0">
          <td className={td}><SkeletonCell className="mb-2 h-3.5 w-3/5" /><SkeletonCell className="w-4/5" /></td>
          <td className={td}><SkeletonCell className="w-12" /></td>
          <td className={td}><SkeletonCell className="w-16" /></td>
          <td className={td}><SkeletonCell className="h-6 w-20" /></td>
          <td className={td}><SkeletonCell className="w-16" /></td>
          <td className={td}><SkeletonCell className="w-12" /></td>
          <td className={td}><SkeletonCell className="w-44" /></td>
        </tr>
      ))}
    </>
  );
}

function StateRow({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-12 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 text-sm text-muted">
          {children}
          {action}
        </div>
      </td>
    </tr>
  );
}

export function ApplicationsTable({
  apps,
  loaded,
  loading = false,
  error = "",
  emptyKind = "filters",
  onOpen,
  onStatusChange,
  onRetry,
  onEmptyAction,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [apps]);

  const showInitialSkeleton = loading && apps.length === 0;
  const showDatabaseEmpty = loaded && !loading && !error && apps.length === 0 && emptyKind === "database";
  const showFilterEmpty = loaded && !loading && !error && apps.length === 0 && emptyKind === "filters";

  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-surface" aria-busy={loading}>
      {loading && loaded && apps.length > 0 && (
        <div className="pointer-events-none absolute top-2 right-3 z-20 flex items-center gap-2 rounded-md border border-line bg-surface/95 px-2.5 py-1 text-xs text-muted shadow-sm" role="status">
          <span className="size-1.5 animate-pulse rounded-full bg-status-applied" />
          Updating applications…
        </div>
      )}
      <div ref={scrollRef} className="h-[min(640px,calc(100vh-260px))] max-w-full overflow-auto">
        <table className="jt-table h-full min-w-[1170px] w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className={th}>Company</th>
              <th className={th}>Via</th>
              <th className={th}>Applied</th>
              <th className={th}>Status</th>
              <th className={cn(th, "min-w-[130px]")}>Follow up</th>
              <th className={th}>Salary</th>
              <th className={th}>Contact</th>
            </tr>
          </thead>
          <tbody>
            {showInitialSkeleton ? <TableSkeleton /> : null}
            {!showInitialSkeleton && error ? (
              <StateRow action={onRetry && <button type="button" onClick={onRetry} className="mt-2 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-fg hover:bg-subtle">Retry</button>}>
                <strong className="font-medium text-fg">Could not load applications</strong>
                <span>{error}</span>
              </StateRow>
            ) : null}
            {!showInitialSkeleton && !error && showDatabaseEmpty ? (
              <StateRow action={onEmptyAction && <button type="button" onClick={onEmptyAction} className="mt-2 rounded-md bg-fg px-3 py-1.5 text-xs font-medium text-canvas hover:opacity-90">Add application</button>}>
                <strong className="font-medium text-fg">No applications yet</strong>
                <span>Add your first application to start tracking follow-ups.</span>
              </StateRow>
            ) : null}
            {!showInitialSkeleton && !error && showFilterEmpty ? (
              <StateRow action={onEmptyAction && <button type="button" onClick={onEmptyAction} className="mt-2 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-fg hover:bg-subtle">Clear filters</button>}>
                <strong className="font-medium text-fg">No matching applications</strong>
                <span>Try changing your search, status, or source filters.</span>
              </StateRow>
            ) : null}
            {!showInitialSkeleton && apps.map((a) => {
              const due = dueState(a);
              const followUp = ACTIVE.has(a.status) ? fmt(a.followUp) : "—";
              const linkOk = isLikelyUrl(a.link);
              return (
                <tr
                  key={a.id}
                  tabIndex={0}
                  onClick={() => onOpen(a)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && event.target === event.currentTarget) onOpen(a);
                  }}
                  className="cursor-pointer border-b border-line/60 last:border-b-0 transition-colors hover:bg-subtle/40 focus-visible:outline-2 focus-visible:-outline-offset-2"
                >
                  <td className={cn(td, "break-words") }>
                    <span className="flex flex-wrap items-center gap-x-1.5 font-semibold text-fg">
                      {a.company}
                      {due && <span className="inline-block size-1.5 rounded-full bg-overdue" title="Follow-up overdue or missing" />}
                      {linkOk && (
                        <a href={normalizeUrl(a.link)} target="_blank" rel="noreferrer" aria-label={`Open job link for ${a.company}`} onClick={(event) => event.stopPropagation()} className="text-muted hover:text-fg">
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </span>
                    <small className="mt-0.5 block line-clamp-2 break-words text-[11.5px] text-muted">
                      {a.role}{a.location ? ` · ${a.location}` : ""}{a.workMode ? ` · ${a.workMode}` : ""}
                    </small>
                    {a.status === "Rejected" && a.rejectReason && <small className="mt-0.5 block line-clamp-2 text-[11.5px] text-muted">Reason: {a.rejectReason}</small>}
                  </td>
                  <td className={cn(td, "text-muted")}>{a.source || "—"}</td>
                  <td className={cn(td, "font-mono tabular-nums text-muted")}>{fmt(a.applied)}</td>
                  <td className={td}>
                    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                      <Select value={a.status} options={STATUS_OPTIONS} onChange={(value) => onStatusChange(a, value as Status)} ariaLabel={`Change status for ${a.company}`} className="h-auto border-0 bg-transparent p-0 hover:border-0 hover:bg-transparent hover:opacity-85" renderValue={() => <StatusPill status={a.status} />} />
                    </div>
                  </td>
                  <td className={cn(td, "whitespace-nowrap font-mono text-[13px] tabular-nums", due === "over" || due === "missing" ? "font-semibold text-overdue" : due === "today" ? "font-semibold text-status-followed" : "")}>
                    {due === "missing" ? "not set" : followUp}
                  </td>
                  <td className={cn(td, "whitespace-nowrap font-mono text-[13px] tabular-nums text-muted")}>{a.salary || "—"}</td>
                  <td className={cn(td, "min-w-0 text-[13px] text-muted")}>
                    {isEmail(a.contact) ? (
                      <a href={`mailto:${a.contact.trim()}`} title={a.contact} onClick={(event) => event.stopPropagation()} className="inline-flex max-w-full min-w-0 items-center gap-1 hover:text-fg">
                        <Mail className="size-3.5 shrink-0" /><span className="truncate">{a.contact}</span>
                      </a>
                    ) : <span className="block truncate" title={a.contact || undefined}>{a.contact || "—"}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
