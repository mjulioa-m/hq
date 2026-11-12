import { asc, eq, lte, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { getDb } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { addInterval, isReminderUnit, type ReminderUnit } from "@/lib/reminder-schedule";

export type ReminderInput = {
  name: string;
  everyAmount: number;
  everyUnit: ReminderUnit;
};

export function parseReminderInput(body: unknown):
  | { ok: true; value: ReminderInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return { ok: false, error: "Escribe el nombre." };
  if (name.length > 120) return { ok: false, error: "El nombre es demasiado largo." };
  const everyAmount = Number(b.everyAmount);
  if (!Number.isInteger(everyAmount) || everyAmount < 1 || everyAmount > 365) {
    return { ok: false, error: "El intervalo tiene que ser entre 1 y 365." };
  }
  const everyUnit = String(b.everyUnit ?? "");
  if (!isReminderUnit(everyUnit)) return { ok: false, error: "Ese intervalo no es válido." };
  return { ok: true, value: { name, everyAmount, everyUnit } };
}

export async function listReminders() {
  const db = getDb();
  return db.select().from(reminders).orderBy(asc(reminders.nextAt));
}

export async function countDueReminders(now = new Date()) {
  const db = getDb();
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(reminders)
    .where(lte(reminders.nextAt, now));
  return rows[0]?.n ?? 0;
}

export async function createReminder(input: ReminderInput) {
  const db = getDb();
  const rows = await db
    .insert(reminders)
    .values({
      ...input,
      nextAt: addInterval(new Date(), input.everyAmount, input.everyUnit),
    })
    .returning();
  const item = rows[0];
  await logActivity({
    section: "recordatorios",
    action: "crear",
    summary: `Recordatorio: ${item.name}`,
    refId: item.id,
  });
  return item;
}

export async function updateReminder(id: string, input: ReminderInput) {
  const db = getDb();
  const current = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
  if (!current[0]) return null;
  const intervalChanged =
    current[0].everyAmount !== input.everyAmount || current[0].everyUnit !== input.everyUnit;
  const rows = await db
    .update(reminders)
    .set({
      name: input.name,
      everyAmount: input.everyAmount,
      everyUnit: input.everyUnit,
      ...(intervalChanged
        ? { nextAt: addInterval(new Date(), input.everyAmount, input.everyUnit) }
        : {}),
    })
    .where(eq(reminders.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function completeReminder(id: string) {
  const db = getDb();
  const current = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
  if (!current[0]) return null;
  const unit = isReminderUnit(current[0].everyUnit) ? current[0].everyUnit : "day";
  const rows = await db
    .update(reminders)
    .set({ nextAt: addInterval(new Date(), current[0].everyAmount, unit) })
    .where(eq(reminders.id, id))
    .returning();
  const item = rows[0];
  await logActivity({
    section: "recordatorios",
    action: "listo",
    summary: `Listo: ${item.name}`,
    refId: item.id,
  });
  return item;
}

export async function deleteReminder(id: string) {
  const db = getDb();
  const rows = await db.delete(reminders).where(eq(reminders.id, id)).returning();
  if (!rows[0]) return false;
  await logActivity({
    section: "recordatorios",
    action: "borrar",
    summary: `Se quitó: ${rows[0].name}`,
    refId: id,
  });
  return true;
}
