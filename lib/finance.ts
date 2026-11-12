import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { isISODate, monthRange } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { financeEntries } from "@/lib/db/schema";
import { parseAmount } from "@/lib/money";

export type FinanceInput = {
  type: "ingreso" | "gasto";
  amount: string;
  category: string;
  description: string;
  entryDate: string;
  projectId: string | null;
  currency: string;
};

export function parseFinanceInput(body: unknown):
  | { ok: true; value: FinanceInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const type = String(b.type ?? "");
  if (type !== "ingreso" && type !== "gasto") return { ok: false, error: "El tipo no es válido." };
  const amount = parseAmount(b.amount);
  if (amount === null || amount <= 0) return { ok: false, error: "Escribe un monto mayor que cero." };
  const entryDate = String(b.entryDate ?? "");
  if (!isISODate(entryDate)) return { ok: false, error: "La fecha no es válida." };
  const category = String(b.category ?? "Otros").trim().slice(0, 80) || "Otros";
  return {
    ok: true,
    value: {
      type,
      amount: amount.toFixed(2),
      category,
      description: String(b.description ?? "").trim().slice(0, 240),
      entryDate,
      projectId: b.projectId ? String(b.projectId) : null,
      currency: "COP",
    },
  };
}

export async function listEntries(filter: { projectId?: string | null; from?: string; to?: string }) {
  const db = getDb();
  const where = [];
  if (filter.projectId) where.push(eq(financeEntries.projectId, filter.projectId));
  if (filter.from) where.push(gte(financeEntries.entryDate, filter.from));
  if (filter.to) where.push(lte(financeEntries.entryDate, filter.to));
  return db
    .select()
    .from(financeEntries)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(financeEntries.entryDate), desc(financeEntries.createdAt));
}

export async function createEntry(input: FinanceInput) {
  const db = getDb();
  const rows = await db.insert(financeEntries).values(input).returning();
  const entry = rows[0];
  await logActivity({
    section: "finanzas",
    action: input.type,
    summary: `${input.type}: ${input.amount} · ${input.description || input.category}`,
    refId: entry.id,
  });
  return entry;
}

export async function updateEntry(id: string, input: FinanceInput) {
  const db = getDb();
  const rows = await db.update(financeEntries).set(input).where(eq(financeEntries.id, id)).returning();
  return rows[0] ?? null;
}

export async function deleteEntry(id: string) {
  const db = getDb();
  const rows = await db.delete(financeEntries).where(eq(financeEntries.id, id)).returning();
  if (rows[0]) {
    await logActivity({
      section: "finanzas",
      action: "eliminar",
      summary: rows[0].description || rows[0].category,
      refId: rows[0].id,
    });
  }
  return rows[0] ?? null;
}

export function summarize(entries: { type: string; amount: string }[]) {
  let income = 0;
  let expense = 0;
  for (const entry of entries) {
    const n = Number(entry.amount);
    if (entry.type === "ingreso") income += n;
    else expense += n;
  }
  return { income, expense, balance: income - expense };
}

export async function monthlySeries(projectId?: string | null, months: string[] = []) {
  const db = getDb();
  const where = [];
  if (projectId) where.push(eq(financeEntries.projectId, projectId));
  if (months.length) {
    const range = monthRange(months[0]);
    const end = monthRange(months[months.length - 1]);
    where.push(gte(financeEntries.entryDate, range.from));
    where.push(lte(financeEntries.entryDate, end.to));
  }
  const rows = await db
    .select({
      ym: sql<string>`to_char(${financeEntries.entryDate}::date, 'YYYY-MM')`,
      type: financeEntries.type,
      total: sql<string>`coalesce(sum(${financeEntries.amount}), 0)::text`,
    })
    .from(financeEntries)
    .where(where.length ? and(...where) : undefined)
    .groupBy(sql`1`, financeEntries.type);
  return months.map((ym) => {
    const income = Number(rows.find((r) => r.ym === ym && r.type === "ingreso")?.total ?? 0);
    const expense = Number(rows.find((r) => r.ym === ym && r.type === "gasto")?.total ?? 0);
    return { ym, income, expense };
  });
}
