"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { X } from "./icons";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Centered dialog with scrim. Handles focus trap (Tab cycles inside), Escape to
 * close (deference to open Select popups via propagation stopping), focus restore
 * to the trigger, and body scroll lock. Escape/Tab are window listeners so React
 * handlers deeper in the tree can consume the event first.
 */
export function Modal({ open, onClose, title, children, className }: Props) {
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
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-48px)] w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-2xl outline-none",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="text-sm font-semibold tracking-tight text-fg">{title}</h3>
          <Button variant="quiet" onClick={onClose} aria-label="Close" className="px-2 py-1.5 text-muted hover:text-fg">
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </>
  );
}
