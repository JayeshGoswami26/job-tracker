import { cn } from "@/lib/cn";
import type { Status } from "@/lib/types";

const badgeStyles: Record<Status, string> = {
  Applied: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Followed up": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Interview: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Offer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const dotColors: Record<Status, string> = {
  Applied: "bg-sky-400",
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
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap",
        badgeStyles[status],
        className,
      )}
    >
      <span className={cn("inline-block size-1.5 rounded-full", dotColors[status])} />
      {status}
    </span>
  );
}
