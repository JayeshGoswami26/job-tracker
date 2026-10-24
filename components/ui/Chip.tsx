import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: ReactNode;
};

export function Chip({ active, onClick, count, children }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex flex-none items-center rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors select-none",
        active
          ? "border-line bg-subtle text-fg font-semibold shadow-xs"
          : "border-transparent text-muted hover:text-fg hover:bg-subtle/50",
      )}
    >
      <span>{children}</span>
      {count != null && (
        <span
          className={cn(
            "ml-1.5 font-mono text-[8.8px] tabular-nums",
            active ? "text-fg font-semibold" : "text-muted opacity-75",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
