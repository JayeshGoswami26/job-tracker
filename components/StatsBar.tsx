import { cn } from "@/lib/cn";
import { Calendar, Chat, ChevronDown, Document, Users } from "./ui/icons";

type Props = {
  dueCount: number;
  waitingCount: number;
  interviewCount: number;
  totalCount: number;
};

export function StatsBar({ dueCount, waitingCount, interviewCount, totalCount }: Props) {
  const stats = [
    {
      label: "Follow-ups due",
      value: dueCount,
      icon: Calendar,
      caption: dueCount > 0 ? "Needs a follow-up" : "No pending follow-ups",
      alert: dueCount > 0,
      tile: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    },
    {
      label: "Waiting for reply",
      value: waitingCount,
      icon: Chat,
      caption: "Awaiting response",
      alert: false,
      tile: "bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400",
    },
    {
      label: "Interviews",
      value: interviewCount,
      icon: Users,
      caption: "Upcoming interviews",
      alert: false,
      tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      label: "Total applied",
      value: totalCount,
      icon: Document,
      caption: "Applications sent",
      alert: false,
      tile: "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400",
    },
  ];

  return (
    <section aria-label="Summary" className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex items-center gap-6 rounded-xl border border-line bg-surface shadow-2xs px-[14.4px] py-[14.4px] transition-colors hover:border-tab-active-line"
          >
            <span className={cn("flex size-[49.6px] shrink-0 items-center justify-center rounded-xl", s.tile)}>
              <Icon className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-muted">{s.label}</span>
              <b
                className={cn(
                  "block text-[28.8px] leading-tight font-semibold tracking-tight tabular-nums",
                  s.alert ? "text-overdue" : "text-fg",
                )}
              >
                {s.value}
              </b>
              <span className="block truncate text-sm text-muted">{s.caption}</span>
            </div>
            <ChevronDown className="-rotate-90 size-5 shrink-0 text-muted" aria-hidden="true" />
          </div>
        );
      })}
    </section>
  );
}
