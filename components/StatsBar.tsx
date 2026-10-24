import { cn } from "@/lib/cn";

type Props = {
  dueCount: number;
  waitingCount: number;
  interviewCount: number;
  totalCount: number;
};

export function StatsBar({ dueCount, waitingCount, interviewCount, totalCount }: Props) {
  const stats = [
    { label: "Follow-ups due", value: dueCount, alert: dueCount > 0 },
    { label: "Waiting for reply", value: waitingCount },
    { label: "Interviews", value: interviewCount },
    { label: "Total applied", value: totalCount },
  ];

  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3.5 transition-colors hover:border-zinc-700/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">{s.label}</span>
            {s.alert && <span className="inline-block size-1.5 rounded-full bg-overdue" />}
          </div>
          <b className={cn("font-mono text-2xl font-semibold tracking-tight tabular-nums", s.alert ? "text-overdue" : "text-fg")}>
            {s.value}
          </b>
        </div>
      ))}
    </section>
  );
}
