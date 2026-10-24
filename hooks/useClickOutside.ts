"use client";

import { useEffect, type RefObject } from "react";

export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onOutside: () => void,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      const inside = refs.some((r) => r.current && r.current.contains(target));
      if (!inside) onOutside();
    };
    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
  }, [refs, onOutside, active]);
}
