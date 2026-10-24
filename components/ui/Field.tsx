import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  /** Span both columns of the form grid. */
  full?: boolean;
  /** Non-blocking helper text rendered under the control. */
  hint?: ReactNode;
  children: ReactNode;
};

export function Field({ label, full, hint, children }: Props) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-2 text-[15px] font-medium text-muted", full && "sm:col-span-2")}>
      <span className="text-fg/85">{label}</span>
      {children}
      {hint != null && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}
