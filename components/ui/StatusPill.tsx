import { cn } from "@/lib/cn";
import type { Status } from "@/lib/types";

const colors: Record<Status, string> = {
  Applied: "text-status-applied",
  "Followed up": "text-status-followed",
  Interview: "text-status-interview",
  Offer: "text-status-offer",
  Rejected: "text-status-rejected",
  Closed: "text-status-closed",
};

export function statusColor(status: Status): string {
  return colors[status];
}

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap", statusColor(status), className)}>
      <span className="inline-block size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
