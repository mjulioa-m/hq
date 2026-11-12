import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { logActivity } from "@/lib/activity";

export async function listProjects() {
  const db = getDb();
  return db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.name));
}

export async function getProjectBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getProjectById(id: string) {
  const db = getDb();
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function resolveProjectId(slug?: string | null) {
  if (!slug || slug === "todos") return null;
  const project = await getProjectBySlug(slug);
  return project?.id ?? null;
}

export function parseProjectPatch(body: unknown):
  | { ok: true; value: { name?: string; description?: string; color?: string } }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const patch: { name?: string; description?: string; color?: string } = {};
  if (b.name !== undefined) {
    const name = String(b.name).trim();
    if (!name) return { ok: false, error: "El nombre es obligatorio." };
    if (name.length > 80) return { ok: false, error: "El nombre es demasiado largo." };
    patch.name = name;
  }
  if (b.description !== undefined) {
    patch.description = String(b.description).trim().slice(0, 500);
  }
  if (b.color !== undefined) {
    const color = String(b.color).trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      return { ok: false, error: "El color tiene que ser hexadecimal, por ejemplo #f0c7a6." };
    }
    patch.color = color;
  }
  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "Nada que actualizar." };
  }
  return { ok: true, value: patch };
}

export async function updateProject(
  id: string,
  patch: { name?: string; description?: string; color?: string }
) {
  const db = getDb();
  const rows = await db.update(projects).set(patch).where(eq(projects.id, id)).returning();
  const project = rows[0] ?? null;
  if (project) {
    await logActivity({
      section: "proyectos",
      action: "actualizar",
      summary: `Proyecto actualizado: ${project.name}`,
      refId: project.id,
    });
  }
  return project;
}
