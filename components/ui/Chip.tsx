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
        "flex flex-none items-center rounded-full border px-3 py-1 text-[13px] font-medium cursor-pointer transition-colors",
        active ? "border-fg bg-fg text-bg" : "border-line bg-transparent text-muted hover:bg-subtle",
      )}
    >
      {children}
      {count != null && <span className="ml-1.5 font-mono text-xs opacity-65 tabular-nums">{count}</span>}
    </button>
  );
}
