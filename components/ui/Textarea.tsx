import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { controlBaseClass } from "./Input";

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlBaseClass, "p-3 leading-relaxed resize-y min-h-[76.8px]", className)}
      {...rest}
    />
  );
}
