import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { isISODate } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { dailyNotes } from "@/lib/db/schema";

export async function getDaily(date: string) {
  const db = getDb();
  const rows = await db.select().from(dailyNotes).where(eq(dailyNotes.date, date)).limit(1);
  return rows[0] ?? { date, content: "", updatedAt: null };
}

export function parseDailyInput(body: unknown):
  | { ok: true; value: { content: string } }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const content = String(b.content ?? "");
  if (content.length > 20000) return { ok: false, error: "El diario es demasiado largo." };
  return { ok: true, value: { content } };
}

export async function saveDaily(date: string, content: string) {
  if (!isISODate(date)) return null;
  const db = getDb();
  const rows = await db
    .insert(dailyNotes)
    .values({ date, content, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: dailyNotes.date,
      set: { content, updatedAt: new Date() },
    })
    .returning();
  await logActivity({
    section: "diario",
    action: "guardar",
    summary: `Diario del ${date}`,
    refId: date,
  });
  return rows[0] ?? null;
}
