import { cn } from "@/lib/cn";
import { FOLLOW_DAYS, addDays, fmt, today } from "@/lib/date";
import { dueLabel, dueState } from "@/lib/status";
import type { App } from "@/lib/types";
import { Button } from "./ui/Button";

type Props = {
  items: App[];
  onFollowUp: (a: App) => void;
  onClose: (a: App) => void;
  onCopy: (text: string) => void;
  onOpen: (a: App) => void;
};

/** Follow-up queue — collapsed to a single line when nothing is due. */
export function FollowUpQueue({ items, onFollowUp, onClose, onCopy, onOpen }: Props) {
  return (
    <section aria-label="Follow-ups">
      <h2 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted uppercase select-none">
        Follow up <span className="font-mono text-xs tracking-normal text-fg">{items.length}</span>
      </h2>

      {items.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-xs text-muted">
          <span className="inline-block size-1.5 rounded-full bg-status-offer" />
          <span>Nothing due — you are up to date.</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          {items.map((a) => {
            const state = dueState(a);
            const label = state ? dueLabel(state, a) : "";
            return (
              <div
                key={a.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-line/60 px-4 py-3 first:border-t-0",
                  "md:grid-cols-[minmax(0,1fr)_auto_auto]",
                  state === "over" && "border-l-2 border-l-overdue",
                  state === "today" && "border-l-2 border-l-status-followed",
                  state === "missing" && "border-l-2 border-l-overdue",
                )}
              >
                <button type="button" onClick={() => onOpen(a)} className="min-w-0 cursor-pointer text-left">
                  <strong className="block text-xs font-semibold text-fg break-words hover:underline">{a.company}</strong>
                  <small className="block text-[11.5px] text-muted break-words mt-0.5">
                    {a.role}
                    {a.source ? ` · ${a.source}` : ""} · applied {fmt(a.applied)}
                  </small>
                </button>
                <span
                  className={cn(
                    "font-mono text-xs whitespace-nowrap tabular-nums",
                    state === "today" ? "font-medium text-status-followed" : "font-medium text-overdue",
                  )}
                >
                  {label}
                </span>
                <div className="flex flex-wrap gap-2 col-span-full md:col-span-auto">
                  <Button
                    variant="primary"
                    onClick={() => onFollowUp(a)}
                    title={`Mark followed up, next check in ${FOLLOW_DAYS} days (${fmt(addDays(today(), FOLLOW_DAYS))})`}
                  >
                    Mark followed up
                  </Button>
                  {a.contact && <Button onClick={() => onCopy(a.contact)}>Copy contact</Button>}
                  <Button variant="quiet" onClick={() => onClose(a)}>
                    No response, close
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
