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
        "w-full min-w-0 overflow-x-auto rounded-xl border border-line bg-surface p-[5.6px] [scrollbar-width:thin]",
        className,
      )}
    >
      <div ref={trackRef} className="relative flex w-max min-w-full items-center gap-1">
        {indicator.ready && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-0 rounded-lg border border-tab-active-line bg-tab-active transition-[transform,width] duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
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
                "relative z-10 flex shrink-0 items-center whitespace-nowrap rounded-lg border border-transparent px-[15.2px] py-3 text-[12px] font-medium cursor-pointer select-none",
                isActive ? "font-semibold text-tab-count dark:text-fg" : "text-slate-600 dark:text-muted hover:text-fg",
              )}
            >
              {isActive && <span aria-hidden="true" className="mr-2 inline-block size-2 rounded-full bg-tab-count dark:bg-status-applied" />}
              <span>{tab.label}</span>
              {tab.count != null && (
                <span
                  className={cn(
                    "tabular-nums",
                    isActive
                      ? "ml-2.5 flex h-6 min-w-6 items-center justify-center rounded-md bg-tab-count px-1.5 text-[10.4px] font-semibold text-white"
                      : "ml-2.5 text-[12px] font-normal",
                  )}
                >
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
