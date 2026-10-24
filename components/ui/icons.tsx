import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export function ChevronDown(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExternalLink(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M9 3h4v4M13 3l-6 6M11 9.5V12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Mail(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <rect x="2" y="3.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="m2.8 4.4 5.2 4 5.2-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Search(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.4 10.4 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Download(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M8 2.5v7M5 7l3 3 3-3M3 12.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Plus(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function X(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
