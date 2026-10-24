import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "default" | "quiet" | "danger" | "confirm";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg border-accent hover:bg-accent-hover hover:border-accent-hover font-semibold shadow-xs",
  default: "bg-surface text-fg border-line hover:bg-subtle hover:border-zinc-700/60",
  quiet: "bg-transparent border-transparent text-muted hover:bg-subtle hover:text-fg",
  danger: "bg-surface border-line text-status-rejected hover:bg-subtle hover:border-status-rejected/40",
  confirm: "bg-status-rejected text-white border-status-rejected hover:opacity-90",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "default", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors select-none",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
});
