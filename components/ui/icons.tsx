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

export function Upload(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M8 10V3M5 6l3-3 3 3M3 12.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

export function Calendar(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Chat(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M2.5 4.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H7l-3 2.5V11h-.5A1.5 1.5 0 0 1 2.5 9.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Users(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <circle cx="6" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 13.5c0-2.2 1.8-3.75 4-3.75s4 1.55 4 3.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 3.9a2 2 0 0 1 0 3.9M11.6 9.9c1.6.3 2.6 1.6 2.6 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Document(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M4 1.8h5l3 3v8.4a.8.8 0 0 1-.8.8H4a.8.8 0 0 1-.8-.8V2.6A.8.8 0 0 1 4 1.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9 1.8v3h3M5.5 9h5M5.5 11.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Building(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 5h1M9 5h1M6 8h1M9 8h1M6.5 14v-2.5h3V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Briefcase(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <rect x="2" y="4.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 4.5V3.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.3M2 8.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Link(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M6.6 9.4a2.5 2.5 0 0 0 3.5 0l2.2-2.2a2.5 2.5 0 0 0-3.5-3.5L7.8 4.7M9.4 6.6a2.5 2.5 0 0 0-3.5 0L3.7 8.8a2.5 2.5 0 0 0 3.5 3.5l1.1-1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapPin(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M8 14.5s4.5-4 4.5-7.5a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.5 4.5 7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Home(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M2.5 7.2 8 2.8l5.5 4.4V13a.8.8 0 0 1-.8.8H3.3a.8.8 0 0 1-.8-.8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.5 13.8V9.5h3v4.3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function Phone(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M4.2 2.2h2.1l1 2.9-1.5 1.2a7.4 7.4 0 0 0 3.9 3.9l1.2-1.5 2.9 1v2.1a1.2 1.2 0 0 1-1.3 1.2A10.9 10.9 0 0 1 3 3.5a1.2 1.2 0 0 1 1.2-1.3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IdCard(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <rect x="1.8" y="3.5" width="12.4" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.6" cy="7.2" r="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.8 11c.3-1 1-1.5 1.8-1.5s1.5.5 1.8 1.5M9.5 6.5h3M9.5 9h2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ListStatus(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M6.5 4h7M6.5 8h7M6.5 12h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="3.2" cy="4" r="0.9" fill="currentColor" />
      <circle cx="3.2" cy="8" r="0.9" fill="currentColor" />
      <circle cx="3.2" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function Lines(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Save(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M3 2.5h8.5l2 2V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5 2.5v3h5v-3M5 13.5V9.5h6v4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function Trash(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.2a1 1 0 0 0 1 .8h4.6a1 1 0 0 0 1-.8L12 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function User(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.8 14c.6-2.6 2.6-4 5.2-4s4.6 1.4 5.2 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function XCircle(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="m6 6 4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Pencil(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="1em" height="1em" aria-hidden {...p}>
      <path
        d="M10.5 2.8a1.5 1.5 0 0 1 2.1 2.1L5.4 12.1 2.5 13.5l1.4-2.9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
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
