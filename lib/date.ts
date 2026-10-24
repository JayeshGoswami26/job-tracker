export const FOLLOW_DAYS = 7;

/** Local-timezone ISO date (YYYY-MM-DD). toISOString alone shifts with the timezone. */
export function today(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Days from today to the given date (negative = past). */
export function diffDays(iso: string): number {
  return Math.round((new Date(iso + "T00:00:00").getTime() - new Date(today() + "T00:00:00").getTime()) / 864e5);
}

/** "24 Oct" style short date; "—" when empty. */
export function fmt(iso: string): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
