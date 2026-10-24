import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const controlBaseClass =
  "w-full rounded-md border border-line bg-surface text-sm text-fg placeholder:text-muted/60 transition-colors focus:border-zinc-500 focus:outline-none";

export const controlClass =
  "w-full h-9 rounded-md border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted/60 transition-colors focus:border-zinc-500 focus:outline-none";

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...rest} />;
}
