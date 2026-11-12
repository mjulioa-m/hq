import { and, desc, eq, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { isISODate } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { decisions } from "@/lib/db/schema";

const STATUSES = new Set(["pendiente", "decidida", "descartada"]);

export type DecisionInput = {
  title: string;
  context: string;
  options: string[];
  dueDate: string | null;
  projectId: string | null;
};

export function parseDecisionInput(body: unknown):
  | { ok: true; value: DecisionInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return { ok: false, error: "Escribe la decisión." };
  let dueDate: string | null = null;
  if (b.dueDate) {
    dueDate = String(b.dueDate);
    if (!isISODate(dueDate)) return { ok: false, error: "La fecha no es válida." };
  }
  const options = Array.isArray(b.options)
    ? b.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 12)
    : String(b.options ?? "")
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean)
        .slice(0, 12);
  return {
    ok: true,
    value: {
      title: title.slice(0, 240),
      context: String(b.context ?? "").trim().slice(0, 8000),
      options,
      dueDate,
      projectId: b.projectId ? String(b.projectId) : null,
    },
  };
}

export async function listDecisions(filter?: { projectId?: string | null; status?: string }) {
  const db = getDb();
  const where = [];
  if (filter?.projectId) where.push(eq(decisions.projectId, filter.projectId));
  if (filter?.status) where.push(eq(decisions.status, filter.status));
  return db
    .select()
    .from(decisions)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(decisions.createdAt));
}

export async function createDecision(input: DecisionInput) {
  const db = getDb();
  const rows = await db.insert(decisions).values(input).returning();
  const decision = rows[0];
  await logActivity({
    section: "decidir",
    action: "crear",
    summary: decision.title,
    refId: decision.id,
  });
  return decision;
}

export async function updateDecision(
  id: string,
  patch: Partial<DecisionInput> & { status?: string; outcome?: string }
) {
  const db = getDb();
  if (patch.status && !STATUSES.has(patch.status)) return null;
  const next: Partial<typeof decisions.$inferInsert> = { ...patch };
  if (patch.status === "decidida" || patch.status === "descartada") next.decidedAt = new Date();
  if (patch.status === "pendiente") next.decidedAt = null;
  const rows = await db.update(decisions).set(next).where(eq(decisions.id, id)).returning();
  const decision = rows[0] ?? null;
  if (decision) {
    await logActivity({
      section: "decidir",
      action: decision.status,
      summary: decision.outcome ? `${decision.title}: ${decision.outcome}` : decision.title,
      refId: decision.id,
    });
  }
  return decision;
}

export async function deleteDecision(id: string) {
  const db = getDb();
  const rows = await db.delete(decisions).where(eq(decisions.id, id)).returning();
  return rows[0] ?? null;
}

export async function countPending(projectId?: string | null) {
  const db = getDb();
  const where = [eq(decisions.status, "pendiente")];
  if (projectId) where.push(eq(decisions.projectId, projectId));
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(decisions)
    .where(and(...where));
  return rows[0]?.n ?? 0;
}
