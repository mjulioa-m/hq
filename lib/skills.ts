import { desc, eq, ilike, or } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { getDb } from "@/lib/db";
import { skills } from "@/lib/db/schema";

export type SkillInput = { name: string; prompt: string };

export function parseSkillInput(body: unknown):
  | { ok: true; value: SkillInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return { ok: false, error: "Escribe el nombre." };
  if (name.length > 120) return { ok: false, error: "El nombre es demasiado largo." };
  const prompt = String(b.prompt ?? "").trim();
  if (!prompt) return { ok: false, error: "Escribe el prompt." };
  if (prompt.length > 20000) return { ok: false, error: "El prompt es demasiado largo." };
  return { ok: true, value: { name, prompt } };
}

export async function listSkills(q?: string) {
  const db = getDb();
  const term = q?.trim();
  const query = db.select().from(skills).orderBy(desc(skills.updatedAt));
  if (!term) return query;
  return query.where(or(ilike(skills.name, `%${term}%`), ilike(skills.prompt, `%${term}%`)));
}

export async function createSkill(input: SkillInput) {
  const db = getDb();
  const rows = await db.insert(skills).values(input).returning();
  const item = rows[0];
  await logActivity({ section: "skills", action: "crear", summary: item.name, refId: item.id });
  return item;
}

export async function updateSkill(id: string, input: SkillInput) {
  const db = getDb();
  const rows = await db
    .update(skills)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(skills.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteSkill(id: string) {
  const db = getDb();
  const rows = await db.delete(skills).where(eq(skills.id, id)).returning();
  if (!rows[0]) return null;
  await logActivity({ section: "skills", action: "borrar", summary: rows[0].name, refId: id });
  return rows[0];
}
