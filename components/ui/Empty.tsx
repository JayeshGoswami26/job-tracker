import type { ReactNode } from "react";

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-surface/40 p-8 text-center text-xs text-muted">
      {children}
    </div>
  );
}
