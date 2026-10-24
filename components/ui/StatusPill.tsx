import { cn } from "@/lib/cn";
import type { Status } from "@/lib/types";

const badgeStyles: Record<Status, string> = {
  Applied: "bg-applied-soft text-applied-fg border-applied-line",
  "Followed up": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Interview: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  Offer: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
  Closed: "bg-slate-500/10 text-slate-700 dark:text-zinc-400 border-slate-500/20",
};

const dotColors: Record<Status, string> = {
  Applied: "bg-status-applied",
  "Followed up": "bg-amber-400",
  Interview: "bg-purple-400",
  Offer: "bg-emerald-400",
  Rejected: "bg-rose-400",
  Closed: "bg-zinc-400",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[26.4px] items-center gap-2 rounded-md border px-3 text-[12px] font-medium whitespace-nowrap",
        badgeStyles[status],
        className,
      )}
    >
      <span className={cn("inline-block size-1.5 rounded-full", dotColors[status])} />
      {status}
    </span>
  );
}
