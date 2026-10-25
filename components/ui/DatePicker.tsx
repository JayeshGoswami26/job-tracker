"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/cn";
import { today } from "@/lib/date";
import { Calendar } from "./icons";
import { FieldShell } from "./FieldShell";

type Props = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  icon?: ReactNode;
  className?: string;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function displayDate(value: string) {
  const date = parseDate(value);
  return date ? `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}` : "Select date";
}

function sameDay(first: Date | null, second: Date | null) {
  return Boolean(first && second && first.getTime() === second.getTime());
}

export function DatePicker({ value, onChange, ariaLabel, icon = <Calendar className="size-4" />, className }: Props) {
  const selected = parseDate(value);
  const fallback = parseDate(today()) ?? new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const date = selected ?? fallback;
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [popupStyle, setPopupStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const bounds = trigger.getBoundingClientRect();
    const width = Math.min(304, window.innerWidth - 24);
    const left = Math.min(Math.max(12, bounds.left), window.innerWidth - width - 12);
    const below = window.innerHeight - bounds.bottom;
    const estimatedHeight = 350;
    const flip = below < estimatedHeight && bounds.top > below;
    setPopupStyle({
      left,
      width,
      ...(flip
        ? { top: Math.max(12, bounds.top - 8), transform: "translateY(-100%)" }
        : { top: bounds.bottom + 8 }),
    });
  }, []);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside([rootRef, popupRef], close, open);

  useEffect(() => {
    if (!open) return;
    place();
    const closeOnMove = () => close();
    window.addEventListener("resize", closeOnMove);
    window.addEventListener("scroll", closeOnMove, true);
    return () => {
      window.removeEventListener("resize", closeOnMove);
      window.removeEventListener("scroll", closeOnMove, true);
    };
  }, [close, open, place]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [close, open]);

  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cellCount = firstDay + daysInMonth > 35 ? 42 : 35;
    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstDay + 1;
      return day > 0 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null;
    });
  }, [month]);

  function openPicker() {
    const date = parseDate(value) ?? parseDate(today()) ?? new Date();
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    place();
    setOpen(true);
  }

  function choose(date: Date) {
    onChange(toIso(date));
    close();
    triggerRef.current?.focus();
  }

  function shiftMonth(amount: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={ariaLabel}
      onClick={() => (open ? close() : openPicker())}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (open) close(); else openPicker();
        }
      }}
      className={cn("inline-flex h-full min-w-0 flex-1 items-center justify-between gap-2 px-4 text-left text-[15px] text-fg cursor-pointer", !value && "text-muted", className)}
    >
      <span>{displayDate(value)}</span>
    </button>
  );

  return (
    <div ref={rootRef} className="relative w-full">
      <FieldShell icon={icon} className="w-full">{trigger}</FieldShell>
      {open && popupStyle && createPortal(
        <div ref={popupRef} role="dialog" aria-label={`${ariaLabel} calendar`} style={popupStyle} className="fixed z-60 rounded-xl border border-line bg-surface p-3 text-fg shadow-xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <strong className="text-sm font-semibold">{MONTHS[month.getMonth()]} {month.getFullYear()}</strong>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} className="flex size-8 items-center justify-center rounded-md text-lg text-muted hover:bg-subtle hover:text-fg">‹</button>
              <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} className="flex size-8 items-center justify-center rounded-md text-lg text-muted hover:bg-subtle hover:text-fg">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted">
            {WEEKDAYS.map((weekday) => <span key={weekday} className="py-1">{weekday}</span>)}
            {days.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} className="size-9" aria-hidden="true" />;
              const iso = toIso(date);
              const isSelected = sameDay(date, selected);
              const isToday = iso === today();
              return (
                <button
                  key={iso}
                  type="button"
                  aria-label={date.toLocaleDateString("en-US", { dateStyle: "full" })}
                  aria-pressed={isSelected}
                  onClick={() => choose(date)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors hover:bg-subtle",
                    isSelected && "bg-page-active font-semibold text-white hover:bg-page-active",
                    !isSelected && isToday && "ring-1 ring-page-active text-page-active",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
            <button type="button" onClick={() => { onChange(""); close(); triggerRef.current?.focus(); }} className="rounded-md px-2 py-1.5 text-muted hover:bg-subtle hover:text-fg">Clear</button>
            <button type="button" onClick={() => choose(parseDate(today()) ?? new Date())} className="rounded-md px-2 py-1.5 font-medium text-page-active hover:bg-page-active/10">Today</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
