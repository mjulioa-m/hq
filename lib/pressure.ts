import { desc, eq, gte } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { getDb } from "@/lib/db";
import { PRESSURE_SLOTS, pressureReadings, type PressureSlot } from "@/lib/db/schema";
import { addDays, isISODate, todayISO } from "@/lib/dates";
import { pressureFieldError, pressurePairError } from "@/lib/pressure-rules";

export const PRESSURE_SLOT_LABEL: Record<PressureSlot, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

export function isPressureSlot(value: string): value is PressureSlot {
  return (PRESSURE_SLOTS as readonly string[]).includes(value);
}

export function parsePressureInput(body: unknown, today = todayISO()):
  | {
      ok: true;
      value: {
        day: string;
        slot: PressureSlot;
        systolic: number;
        diastolic: number;
        pulse: number | null;
        note: string;
      };
    }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const day = String(b.day ?? today);
  if (!isISODate(day) || day > today) return { ok: false, error: "El día no es válido." };
  const slot = String(b.slot ?? "");
  if (!isPressureSlot(slot)) return { ok: false, error: "Elige mañana, tarde o noche." };
  const systolicRaw = String(b.systolic ?? "");
  const diastolicRaw = String(b.diastolic ?? "");
  const systolicError = pressureFieldError("systolic", systolicRaw);
  if (systolicError) return { ok: false, error: systolicError };
  const diastolicError = pressureFieldError("diastolic", diastolicRaw);
  if (diastolicError) return { ok: false, error: diastolicError };
  const pairError = pressurePairError(Number(systolicRaw), Number(diastolicRaw));
  if (pairError) return { ok: false, error: pairError };
  const systolic = Number(systolicRaw);
  const diastolic = Number(diastolicRaw);
  let pulse: number | null = null;
  if (b.pulse !== null && b.pulse !== undefined && String(b.pulse).trim() !== "") {
    const pulseError = pressureFieldError("pulse", String(b.pulse));
    if (pulseError) return { ok: false, error: pulseError };
    pulse = Number(b.pulse);
  }
  return {
    ok: true,
    value: {
      day,
      slot,
      systolic,
      diastolic,
      pulse,
      note: String(b.note ?? "").trim().slice(0, 240),
    },
  };
}

export async function listPressureReadings(since = addDays(todayISO(), -30)) {
  const db = getDb();
  return db
    .select()
    .from(pressureReadings)
    .where(gte(pressureReadings.day, since))
    .orderBy(desc(pressureReadings.day));
}

export async function countPressureToday(day = todayISO()) {
  const db = getDb();
  const rows = await db
    .select({ id: pressureReadings.id })
    .from(pressureReadings)
    .where(eq(pressureReadings.day, day));
  return rows.length;
}

export async function savePressure(input: {
  day: string;
  slot: PressureSlot;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  note: string;
}) {
  const db = getDb();
  const rows = await db
    .insert(pressureReadings)
    .values({ ...input, takenAt: new Date() })
    .onConflictDoUpdate({
      target: [pressureReadings.day, pressureReadings.slot],
      set: {
        systolic: input.systolic,
        diastolic: input.diastolic,
        pulse: input.pulse,
        note: input.note,
        takenAt: new Date(),
      },
    })
    .returning();
  const item = rows[0];
  await logActivity({
    section: "presion",
    action: "anotar",
    summary: `${PRESSURE_SLOT_LABEL[input.slot]} ${input.systolic}/${input.diastolic}`,
    refId: item.id,
  });
  return item;
}

export async function deletePressure(id: string) {
  const db = getDb();
  const rows = await db.delete(pressureReadings).where(eq(pressureReadings.id, id)).returning();
  if (!rows[0]) return null;
  await logActivity({
    section: "presion",
    action: "borrar",
    summary: "Lectura de presión borrada",
    refId: id,
  });
  return rows[0];
}
