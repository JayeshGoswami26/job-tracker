import { FOLLOW_DAYS, diffDays } from "./date";
import type { App, Status } from "./types";

export const ACTIVE = new Set<Status>(["Applied", "Followed up"]);

export type DueState = "over" | "today" | "missing";

/**
 * Follow-up urgency for active applications:
 * - over: follow-up date in the past
 * - today: follow-up date is today
 * - missing: no follow-up planned and applied more than FOLLOW_DAYS ago
 */
export function dueState(a: App): DueState | null {
  if (!ACTIVE.has(a.status)) return null;
  if (!a.followUp) {
    return diffDays(a.applied) <= -FOLLOW_DAYS ? "missing" : null;
  }
  const d = diffDays(a.followUp);
  if (d < 0) return "over";
  if (d === 0) return "today";
  return null;
}

export function dueLabel(state: DueState, a: App): string {
  if (state === "today") return "Due today";
  if (state === "missing") return "No follow-up set";
  const d = -diffDays(a.followUp);
  return `${d} day${d === 1 ? "" : "s"} overdue`;
}

export function matchesFilter(a: App, f: string): boolean {
  if (f === "All") return true;
  if (f === "Active") return ACTIVE.has(a.status) || a.status === "Interview";
  return a.status === f;
}

export function normalizeCompany(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const URL_LIKE = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

export function isLikelyUrl(s: string): boolean {
  const t = s.trim();
  return t.length > 0 && !t.includes(" ") && (/^https?:\/\/\S+$/i.test(t) || URL_LIKE.test(t));
}

export function normalizeUrl(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export const isEmail = (s: string): boolean => /\S+@\S+\.\S+/.test(s.trim());
