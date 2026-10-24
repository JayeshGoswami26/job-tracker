import { cn } from "@/lib/cn";
import { ACTIVE } from "@/lib/status";
import type { App } from "@/lib/types";

type Props = { apps: App[]; dueCount: number };

export function StatsBar({ apps, dueCount }: Props) {
  const stats = [
    { label: "Follow-ups due", value: dueCount, alert: dueCount > 0 },
    { label: "Waiting for reply", value: apps.filter((a) => ACTIVE.has(a.status)).length },
    { label: "Interviews", value: apps.filter((a) => a.status === "Interview").length },
    { label: "Total applied", value: apps.length },
  ];

  return (
    <section aria-label="Summary" className="grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface md:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "px-4.5 py-4",
            i === 1 && "border-l border-line",
            i === 2 && "border-t border-line md:border-t-0 md:border-l",
            i === 3 && "border-t border-line md:border-t-0 md:border-l",
          )}
        >
          <b className={cn("block font-mono text-[26px] leading-tight font-semibold tabular-nums", s.alert && "text-overdue")}>
            {s.value}
          </b>
          <span className="text-[13px] text-muted">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
