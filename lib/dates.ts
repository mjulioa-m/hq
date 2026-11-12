export const TZ = "America/Bogota";

export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function formatLong(iso: string): string {
  const date = isoToUtcNoon(iso);
  const raw = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatLongWithYear(iso: string): string {
  const date = isoToUtcNoon(iso);
  const raw = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(isoToUtcNoon(iso));
}

export function weekdayShort(iso: string): string {
  const name = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "short",
  }).format(isoToUtcNoon(iso));
  return name.replace(".", "").slice(0, 3).toLowerCase();
}

export function dayNumber(iso: string): number {
  return Number(iso.slice(8, 10));
}

export function formatClock(now = new Date()): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

export function monthKey(iso = todayISO()): string {
  return iso.slice(0, 7);
}

export function monthRange(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const from = `${ym}-01`;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const to = `${ym}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function lastMonths(count: number, from = monthKey()): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) out.push(shiftMonth(from, -i));
  return out;
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const raw = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    month: "short",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
  return raw.replace(".", "");
}

export function upcomingDays(count: number, start = todayISO()): string[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export function dayRelationLabel(iso: string, today = todayISO()): string {
  if (iso === today) return "Hoy";
  if (iso === addDays(today, 1)) return "Mañana";
  if (iso === addDays(today, -1)) return "Ayer";
  return formatLong(iso);
}

function isoToUtcNoon(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12));
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
