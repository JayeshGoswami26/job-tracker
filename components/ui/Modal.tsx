"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { X } from "./icons";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Muted line under the title. */
  description?: string;
  children: ReactNode;
  className?: string;
  /** Wider panel for forms with two-column sections. */
  wide?: boolean;
  /** Widest panel, for read-only detail views with multi-column cards. */
  xwide?: boolean;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Centered dialog with scrim. Handles focus trap (Tab cycles inside), Escape to
 * close (deference to open Select popups via propagation stopping), focus restore
 * to the trigger, and body scroll lock. Escape/Tab are window listeners so React
 * handlers deeper in the tree can consume the event first.
 */
export function Modal({ open, onClose, title, description, children, className, wide, xwide }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Respect an autoFocus already inside the panel (e.g. the first form field) —
    // only fall back to the first focusable when nothing is focused yet.
    if (!panel?.contains(document.activeElement)) {
      (focusables()[0] ?? panel)?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || e.defaultPrevented) return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-38.4px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-2xl outline-none",
          xwide
            ? "w-[min(768px,calc(100vw-25.6px))]"
            : wide
              ? "w-[min(544px,calc(100vw-25.6px))]"
              : "w-[min(448px,calc(100vw-25.6px))]",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-[18.4px] py-[14.4px]">
          <div className="min-w-0">
            <h3 className="text-[16px] leading-tight font-semibold text-fg">{title}</h3>
            {description && <p className="mt-1 text-[12px] text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-subtle text-muted transition-colors hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
