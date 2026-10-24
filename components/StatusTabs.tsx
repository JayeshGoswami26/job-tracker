"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
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

type IndicatorGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
  ready: boolean;
};

export function StatusTabs({ tabs, activeId, onChange, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<IndicatorGeometry>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const measureIndicator = useCallback(() => {
    const tab = tabRefs.current.get(activeId);
    if (!tab) return;

    setIndicator({
      left: tab.offsetLeft,
      top: tab.offsetTop,
      width: tab.offsetWidth,
      height: tab.offsetHeight,
      ready: true,
    });
  }, [activeId]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator, tabs]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(measureIndicator);
    observer.observe(track);
    window.addEventListener("resize", measureIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureIndicator);
    };
  }, [measureIndicator]);

  return (
    <div
      role="tablist"
      aria-label="Filter applications by status"
      className={cn(
        "w-full min-w-0 overflow-x-auto rounded-lg border border-line bg-surface/50 p-1.5 [scrollbar-width:thin]",
        className,
      )}
    >
      <div ref={trackRef} className="relative flex w-max min-w-full items-center gap-1">
        {indicator.ready && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-0 rounded-md border border-line bg-subtle shadow-sm transition-[transform,width] duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
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
                "relative z-10 flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-transparent px-2.5 py-1.5 text-sm font-medium cursor-pointer select-none md:px-3",
                isActive ? "font-semibold text-fg" : "text-muted hover:bg-subtle/60 hover:text-fg",
              )}
            >
              <span>{tab.label}</span>
              {tab.count != null && (
                <span className={cn("ml-1.5 font-mono text-[11px] font-medium tabular-nums", isActive ? "text-fg font-semibold" : "text-muted opacity-80")}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
