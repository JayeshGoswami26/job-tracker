import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldShell } from "./FieldShell";

export const controlBaseClass =
  "w-full rounded-md border border-line bg-surface text-sm text-fg placeholder:text-muted/60 transition-colors focus:border-zinc-500 focus:outline-none";

export const controlClass =
  "w-full h-9 rounded-md border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted/60 transition-colors focus:border-zinc-500 focus:outline-none";

type Props = ComponentProps<"input"> & {
  /** Leading icon rendered in its own cell inside the border. */
  icon?: ReactNode;
};

export function Input({ className, icon, ...rest }: Props) {
  if (icon == null) return <input className={cn(controlClass, className)} {...rest} />;
  return (
    <FieldShell icon={icon} className="w-full">
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent px-4 text-[15px] text-fg placeholder:text-muted/60 focus:outline-none",
          className,
        )}
        {...rest}
      />
    </FieldShell>
  );
}
