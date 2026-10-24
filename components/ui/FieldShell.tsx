import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  icon: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * Bordered control row with a leading icon cell. The control inside should be
 * borderless (see `Input` and `Select`) so the shell owns the border and focus ring.
 */
export function FieldShell({ icon, className, children }: Props) {
  return (
    <div
      className={cn(
        "flex min-h-12 min-w-0 items-stretch rounded-lg border border-line bg-surface transition-colors focus-within:border-tab-active-line",
        className,
      )}
    >
      <span aria-hidden="true" className="flex w-12 shrink-0 items-center justify-center border-r border-line text-muted">
        {icon}
      </span>
      {children}
    </div>
  );
}
