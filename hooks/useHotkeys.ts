"use client";

import { useEffect, useRef } from "react";

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

/**
 * Global single-key shortcuts. Skipped while typing in a field, when modifier
 * keys are held, when another handler already consumed the event, or when `active` is false.
 */
export function useHotkeys(map: HotkeyMap, active = true): void {
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current = map;
  });

  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) {
        return;
      }
      const fn = mapRef.current[e.key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);
}
