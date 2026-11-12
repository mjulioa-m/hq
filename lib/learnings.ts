import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { getDb } from "@/lib/db";
import { learnings } from "@/lib/db/schema";

export type LearningInput = {
  title: string;
  content: string;
  tags: string[];
  source: string;
  projectId: string | null;
};

export function parseLearningInput(body: unknown):
  | { ok: true; value: LearningInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return { ok: false, error: "El título es obligatorio." };
  const tags = Array.isArray(b.tags)
    ? b.tags.map((t) => String(t).trim()).filter(Boolean)
    : String(b.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
  return {
    ok: true,
    value: {
      title: title.slice(0, 200),
      content: String(b.content ?? "").trim().slice(0, 20000),
      tags: tags.slice(0, 12).map((t) => t.slice(0, 40)),
      source: String(b.source ?? "").trim().slice(0, 200),
      projectId: b.projectId ? String(b.projectId) : null,
    },
  };
}

export async function listLearnings(filter?: { projectId?: string | null; tag?: string; q?: string }) {
  const db = getDb();
  const where = [];
  if (filter?.projectId) where.push(eq(learnings.projectId, filter.projectId));
  if (filter?.tag) where.push(sql`${filter.tag} = any(${learnings.tags})`);
  if (filter?.q) {
    const like = `%${filter.q}%`;
    where.push(or(ilike(learnings.title, like), ilike(learnings.content, like)));
  }
  return db
    .select()
    .from(learnings)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(learnings.createdAt));
}

export async function createLearning(input: LearningInput) {
  const db = getDb();
  const rows = await db.insert(learnings).values(input).returning();
  const learning = rows[0];
  await logActivity({
    section: "aprendido",
    action: "crear",
    summary: learning.title,
    refId: learning.id,
  });
  return learning;
}

export async function updateLearning(id: string, input: LearningInput) {
  const db = getDb();
  const rows = await db.update(learnings).set(input).where(eq(learnings.id, id)).returning();
  return rows[0] ?? null;
}

export async function deleteLearning(id: string) {
  const db = getDb();
  const rows = await db.delete(learnings).where(eq(learnings.id, id)).returning();
  return rows[0] ?? null;
}
