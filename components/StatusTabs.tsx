"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type TabItem = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  tabs: readonly TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

interface IndicatorGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
  ready: boolean;
}

/**
 * Minimalist segmented tab control with hardware-accelerated sliding highlight pill.
 * Uses exact offset math and smooth cubic-bezier easing without bulky runtime animation libraries.
 */
export function StatusTabs({ tabs, activeId, onChange, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<IndicatorGeometry>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    const el = tabRefs.current.get(activeId);
    if (!el) return;

    setIndicator({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
      ready: true,
    });
  }, [activeId, tabs]);

  // Handle window or layout resize so indicator recalculates accurately
  useLayoutEffect(() => {
    function update() {
      const el = tabRefs.current.get(activeId);
      if (!el) return;
      setIndicator({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        ready: true,
      });
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Filter applications by status"
      className={cn(
        "relative flex w-full min-w-0 flex-wrap items-center gap-1 overflow-visible rounded-lg border border-line bg-surface/50 p-1.5 md:flex-nowrap md:overflow-x-auto [scrollbar-width:thin]",
        className,
      )}
    >
      {/* Sliding minimalist indicator pill */}
      {indicator.ready && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute hidden",
            "transition-[transform,width] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
          )}
          style={{
            transform: `translate3d(${indicator.left}px, ${indicator.top}px, 0)`,
            width: `${indicator.width}px`,
            height: `${indicator.height}px`,
          }}
        />
      )}

      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) tabRefs.current.set(tab.id, node);
              else tabRefs.current.delete(tab.id);
            }}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-transparent px-2.5 py-2 text-sm font-medium cursor-pointer select-none transition-colors md:flex-none md:px-3",
              isActive
                ? "border-line bg-subtle font-semibold text-fg shadow-sm"
                : "text-muted hover:bg-subtle/60 hover:text-fg",
            )}
          >
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={cn(
                  "ml-1.5 rounded-full font-mono text-[11px] font-medium tabular-nums transition-colors",
                  isActive ? "text-fg font-semibold" : "text-muted opacity-80",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
