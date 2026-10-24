import type { ReactNode } from "react";

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-surface p-5 text-center text-muted">{children}</div>
  );
}
