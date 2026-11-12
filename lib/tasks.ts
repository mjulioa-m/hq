import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, lte, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { addDays, isISODate, todayISO } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

const PRIORITIES = new Set(["baja", "normal", "alta"]);

export type TaskInput = {
  title: string;
  notes: string;
  projectId: string | null;
  dueDate: string | null;
  priority: string;
};

export function parseTaskInput(body: unknown):
  | { ok: true; value: TaskInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return { ok: false, error: "Escribe la tarea." };
  if (title.length > 240) return { ok: false, error: "La tarea es demasiado larga." };
  const priority = String(b.priority ?? "normal");
  if (!PRIORITIES.has(priority)) return { ok: false, error: "Prioridad no válida." };
  let dueDate: string | null = null;
  if (b.dueDate) {
    dueDate = String(b.dueDate);
    if (!isISODate(dueDate)) return { ok: false, error: "La fecha no es válida." };
  }
  const projectId = b.projectId ? String(b.projectId) : null;
  return {
    ok: true,
    value: {
      title,
      notes: String(b.notes ?? "").trim().slice(0, 4000),
      projectId,
      dueDate,
      priority,
    },
  };
}

export async function listTasks(filter?: { projectId?: string | null; includeDone?: boolean }) {
  const db = getDb();
  const where = [];
  if (!filter?.includeDone) where.push(eq(tasks.done, false));
  if (filter?.projectId) where.push(eq(tasks.projectId, filter.projectId));
  return db
    .select()
    .from(tasks)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
}

export async function createTask(input: TaskInput) {
  const db = getDb();
  const sameDay = input.dueDate ? eq(tasks.dueDate, input.dueDate) : isNull(tasks.dueDate);
  const maxRows = await db
    .select({ n: sql<number>`coalesce(max(${tasks.sortOrder}), -1)::int` })
    .from(tasks)
    .where(and(eq(tasks.done, false), sameDay));
  const sortOrder = (maxRows[0]?.n ?? -1) + 1;
  const rows = await db.insert(tasks).values({ ...input, sortOrder }).returning();
  const task = rows[0];
  await logActivity({
    section: "tareas",
    action: "crear",
    summary: `Tarea: ${task.title}`,
    refId: task.id,
  });
  return task;
}

export async function updateTask(
  id: string,
  patch: Partial<TaskInput> & { done?: boolean }
) {
  const db = getDb();
  const current = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!current[0]) return null;
  const done = patch.done ?? current[0].done;
  const rows = await db
    .update(tasks)
    .set({
      ...patch,
      done,
      doneAt: done ? current[0].doneAt ?? new Date() : null,
    })
    .where(eq(tasks.id, id))
    .returning();
  const task = rows[0] ?? null;
  if (task) {
    await logActivity({
      section: "tareas",
      action: patch.done === undefined ? "actualizar" : task.done ? "completar" : "reabrir",
      summary: task.title,
      refId: task.id,
    });
  }
  return task;
}

export async function reorderTasks(ids: string[]) {
  if (ids.length === 0) return { ok: false as const, error: "Nada que ordenar." };
  if (ids.length > 200) return { ok: false as const, error: "Son demasiadas tareas." };
  if (new Set(ids).size !== ids.length) return { ok: false as const, error: "La lista viene repetida." };
  const db = getDb();
  const found = await db.select({ id: tasks.id }).from(tasks).where(inArray(tasks.id, ids));
  if (found.length !== ids.length) return { ok: false as const, error: "No está en las tareas." };
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.update(tasks).set({ sortOrder: index }).where(eq(tasks.id, id));
    }
  });
  return { ok: true as const };
}

export async function deleteTask(id: string) {
  const db = getDb();
  const rows = await db.delete(tasks).where(eq(tasks.id, id)).returning();
  if (rows[0]) {
    await logActivity({
      section: "tareas",
      action: "eliminar",
      summary: rows[0].title,
      refId: rows[0].id,
    });
  }
  return rows[0] ?? null;
}

export async function countOpenUntil(day = todayISO(), projectId?: string | null) {
  const db = getDb();
  const where = [eq(tasks.done, false), isNotNull(tasks.dueDate), lte(tasks.dueDate, day)];
  if (projectId) where.push(eq(tasks.projectId, projectId));
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(...where));
  return rows[0]?.n ?? 0;
}

export async function tasksDoneOn(day: string, projectId?: string | null) {
  const db = getDb();
  const start = new Date(`${day}T00:00:00-05:00`);
  const end = new Date(`${addDays(day, 1)}T00:00:00-05:00`);
  const where = [eq(tasks.done, true), gte(tasks.doneAt, start), lt(tasks.doneAt, end)];
  if (projectId) where.push(eq(tasks.projectId, projectId));
  return db.select().from(tasks).where(and(...where)).orderBy(desc(tasks.doneAt));
}
