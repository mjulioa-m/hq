import { TZ } from "@/lib/dates";

export const REMINDER_UNITS = ["hour", "day", "week", "month"] as const;
export type ReminderUnit = (typeof REMINDER_UNITS)[number];

export const REMINDER_PRESETS: { label: string; amount: number; unit: ReminderUnit }[] = [
  { label: "Cada hora", amount: 1, unit: "hour" },
  { label: "Cada día", amount: 1, unit: "day" },
  { label: "Cada 2 días", amount: 2, unit: "day" },
  { label: "Cada semana", amount: 1, unit: "week" },
  { label: "Cada 2 semanas", amount: 2, unit: "week" },
  { label: "Cada mes", amount: 1, unit: "month" },
];

const UNIT_ONE: Record<ReminderUnit, string> = {
  hour: "hora",
  day: "día",
  week: "semana",
  month: "mes",
};

const UNIT_MANY: Record<ReminderUnit, string> = {
  hour: "horas",
  day: "días",
  week: "semanas",
  month: "meses",
};

export function isReminderUnit(value: string): value is ReminderUnit {
  return (REMINDER_UNITS as readonly string[]).includes(value);
}

export function reminderPhrase(amount: number, unit: ReminderUnit): string {
  if (amount === 1) return `Cada ${UNIT_ONE[unit]}`;
  return `Cada ${amount} ${UNIT_MANY[unit]}`;
}

export function addInterval(from: Date, amount: number, unit: ReminderUnit): Date {
  if (unit === "hour") return new Date(from.getTime() + amount * 60 * 60 * 1000);
  if (unit === "day") return new Date(from.getTime() + amount * 24 * 60 * 60 * 1000);
  if (unit === "week") return new Date(from.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(from);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const monthIndex = pick("month") - 1 + amount;
  const year = pick("year") + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const day = Math.min(pick("day"), daysInMonth(year, month));
  return new Date(Date.UTC(year, month, day, pick("hour") + 5, pick("minute")));
}

export function dueLabel(nextAt: Date, now = new Date()): string {
  const delta = nextAt.getTime() - now.getTime();
  if (delta <= 60_000) return "Toca ahora";
  const minutes = Math.round(delta / 60_000);
  if (minutes < 60) return `En ${minutes} min`;
  const hours = Math.round(delta / 3_600_000);
  if (hours < 24) return hours === 1 ? "En 1 hora" : `En ${hours} horas`;
  const days = Math.round(delta / 86_400_000);
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}

export function formatWhen(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}
