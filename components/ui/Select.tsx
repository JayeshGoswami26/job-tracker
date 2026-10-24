"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ChevronDown } from "./icons";

export type SelectOption = { value: string; label: string; hint?: string };

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Shown when value matches no option (e.g. the empty "All sources" case handled by caller). */
  placeholder?: string;
  className?: string;
  popupClassName?: string;
  /** Custom trigger content (defaults to the selected label). */
  renderValue?: (option: SelectOption | null) => ReactNode;
};

const POPUP_MAX = 240;
const FLIP_THRESHOLD = 220;

/**
 * Custom dropdown replacing native <select>. Keyboard-complete listbox:
 * arrows/Home/End navigate, Enter/Space pick, Escape closes (without closing
 * a parent Modal — handled via stopPropagation), type-ahead jumps by label.
 * The popup is position:fixed anchored to the trigger so it is never clipped
 * by a scrollable Modal body, and flips up when the viewport bottom is near.
 */
export function Select({ value, options, onChange, ariaLabel, placeholder = "Select…", className, popupClassName, renderValue }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLUListElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ s: "", t: 0 });
  const id = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const outside = useCallback(() => close(false), [close]);
  useClickOutside([rootRef, popupRef], outside, open);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const flip = below < FLIP_THRESHOLD && r.top > below;
    setStyle(
      flip
        ? {
            left: r.left,
            top: r.top - 6,
            transform: "translateY(-100%)",
            minWidth: r.width,
            maxHeight: Math.min(POPUP_MAX, r.top - 12),
          }
        : {
            left: r.left,
            top: r.bottom + 6,
            minWidth: r.width,
            maxHeight: Math.min(POPUP_MAX, window.innerHeight - r.bottom - 12),
          },
    );
  }, []);

  const openMenu = useCallback(() => {
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : 0);
    place();
    setOpen(true);
  }, [options, value, place]);

  // Close when the anchor moves (page or Modal body scroll) or on resize — but never for
  // scrolls inside the popup itself (its own list scrolling while navigating options).
  // Resize events target the Window, which is not a Node, so guard before contains().
  useEffect(() => {
    if (!open) return;
    const shut = (e: Event) => {
      const t = e.target;
      if (t instanceof Node && popupRef.current && (t === popupRef.current || popupRef.current.contains(t))) return;
      close(false);
    };
    window.addEventListener("scroll", shut, true);
    window.addEventListener("resize", shut);
    return () => {
      window.removeEventListener("scroll", shut, true);
      window.removeEventListener("resize", shut);
    };
  }, [open, close]);

  // Keep the highlighted option visible.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const pick = useCallback(
    (i: number) => {
      const o = options[i];
      if (o) onChange(o.value);
      close();
    },
    [options, onChange, close],
  );

  const typeahead = useCallback(
    (key: string) => {
      const now = Date.now();
      const buf = now - typed.current.t < 500 ? typed.current.s + key : key;
      typed.current = { s: buf, t: now };
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(buf.toLowerCase()));
      if (i >= 0) setActive(i);
    },
    [options],
  );

  function onKey(e: React.KeyboardEvent) {
    if (open && e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        setActive((a) => (a + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        setActive((a) => (a - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        e.stopPropagation();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        e.stopPropagation();
        pick(active);
        break;
      case "Tab":
        close(false);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          typeahead(e.key);
        }
    }
  }

  const isFull = className?.includes("w-full");

  return (
    <div
      ref={rootRef}
      className={cn("relative max-w-full", isFull ? "block w-full" : "inline-block")}
      onKeyDown={onKey}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close(false) : openMenu())}
        className={cn(
          "inline-flex h-9 max-w-full items-center justify-between gap-1.5 rounded-md border border-line bg-surface px-3 text-xs font-medium cursor-pointer transition-colors hover:bg-subtle hover:border-zinc-700/60",
          className,
        )}
      >
        {renderValue ? (
          renderValue(selected)
        ) : (
          <span className={cn("truncate", !selected && "text-muted")}>{selected?.label ?? placeholder}</span>
        )}
        <ChevronDown className={cn("size-3 shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open &&
        style &&
        createPortal(
          <ul
            ref={(el) => {
              popupRef.current = el;
              listRef.current = el;
            }}
            id={id}
            role="listbox"
            aria-label={ariaLabel}
            style={style}
            className={cn(
              "fixed z-[60] min-w-max overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-md",
              popupClassName,
            )}
          >
            {options.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-6 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors",
                  i === active ? "bg-subtle text-fg" : "text-muted hover:text-fg",
                  o.value === value && "font-semibold text-fg",
                )}
              >
                <span>{o.label}</span>
                {o.hint && <span className="text-[11px] text-muted">{o.hint}</span>}
                {o.value === value && <span className="text-fg font-semibold">✓</span>}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
