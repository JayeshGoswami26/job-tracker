import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const controlClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(controlClass, className)} {...rest} />;
});
