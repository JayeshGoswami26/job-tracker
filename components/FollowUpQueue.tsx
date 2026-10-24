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
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
        Follow up <span className="font-mono text-[12px] tracking-normal text-fg">{items.length}</span>
      </h2>

      {items.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] text-muted">
          Nothing due — you are up to date.
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
                  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 border-t border-line px-4 py-3.5 first:border-t-0",
                  "md:grid-cols-[minmax(0,1fr)_auto_auto]",
                  state === "over" && "shadow-[inset_3px_0_0_var(--overdue)]",
                  state === "today" && "shadow-[inset_3px_0_0_var(--followed)]",
                  state === "missing" && "shadow-[inset_3px_0_0_var(--overdue)]",
                )}
              >
                <button type="button" onClick={() => onOpen(a)} className="min-w-0 cursor-pointer text-left">
                  <strong className="block font-semibold break-words hover:underline">{a.company}</strong>
                  <small className="text-[13px] text-muted break-words">
                    {a.role}
                    {a.source ? ` · ${a.source}` : ""} · applied {fmt(a.applied)}
                  </small>
                </button>
                <span
                  className={cn(
                    "font-mono text-[12.5px] whitespace-nowrap",
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
