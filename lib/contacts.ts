import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { CONTACT_STAGES, ACTIVITY_TYPES } from "@/lib/constants";
import { isISODate, monthRange, todayISO } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { contactActivities, contacts } from "@/lib/db/schema";
import { parseAmount } from "@/lib/money";

const STAGES = new Set(CONTACT_STAGES.map((s) => s.id));
const TYPES = new Set(ACTIVITY_TYPES.map((s) => s.id));

export type ContactInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  value: string | null;
  nextAction: string;
  nextActionDate: string | null;
  notes: string;
  projectId: string | null;
};

export function parseContactInput(body: unknown):
  | { ok: true; value: ContactInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  const stage = String(b.stage ?? "lead");
  if (!STAGES.has(stage as "lead")) return { ok: false, error: "Etapa no válida." };
  let value: string | null = null;
  if (b.value !== undefined && b.value !== "" && b.value !== null) {
    const amount = parseAmount(b.value);
    if (amount === null || amount < 0) return { ok: false, error: "El valor no es válido." };
    value = amount.toFixed(2);
  }
  let nextActionDate: string | null = null;
  if (b.nextActionDate) {
    nextActionDate = String(b.nextActionDate);
    if (!isISODate(nextActionDate)) return { ok: false, error: "La fecha no es válida." };
  }
  return {
    ok: true,
    value: {
      name: name.slice(0, 160),
      company: String(b.company ?? "").trim().slice(0, 160),
      email: String(b.email ?? "").trim().slice(0, 160),
      phone: String(b.phone ?? "").trim().slice(0, 40),
      source: String(b.source ?? "").trim().slice(0, 80),
      stage,
      value,
      nextAction: String(b.nextAction ?? "").trim().slice(0, 240),
      nextActionDate,
      notes: String(b.notes ?? "").trim().slice(0, 4000),
      projectId: b.projectId ? String(b.projectId) : null,
    },
  };
}

export async function listContacts(projectId?: string | null) {
  const db = getDb();
  return db
    .select()
    .from(contacts)
    .where(projectId ? eq(contacts.projectId, projectId) : undefined)
    .orderBy(desc(contacts.updatedAt));
}

export async function getContact(id: string) {
  const db = getDb();
  const rows = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createContact(input: ContactInput) {
  const db = getDb();
  const rows = await db
    .insert(contacts)
    .values({
      ...input,
      wonAt: input.stage === "ganado" ? new Date() : null,
      updatedAt: new Date(),
    })
    .returning();
  const contact = rows[0];
  await logActivity({
    section: "ventas",
    action: "crear",
    summary: contact.name,
    refId: contact.id,
  });
  return contact;
}

export async function updateContact(id: string, patch: Partial<ContactInput>) {
  const db = getDb();
  const current = await getContact(id);
  if (!current) return null;
  let wonAt = current.wonAt;
  if (patch.stage && patch.stage !== current.stage) {
    wonAt = patch.stage === "ganado" ? new Date() : patch.stage === "perdido" ? null : current.wonAt;
  }
  const rows = await db
    .update(contacts)
    .set({ ...patch, wonAt, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning();
  const contact = rows[0] ?? null;
  if (contact) {
    await logActivity({
      section: "ventas",
      action: "actualizar",
      summary: `${contact.name}${patch.stage ? ` → ${patch.stage}` : ""}`,
      refId: contact.id,
    });
  }
  return contact;
}

export async function deleteContact(id: string) {
  const db = getDb();
  const rows = await db.delete(contacts).where(eq(contacts.id, id)).returning();
  if (rows[0]) {
    await logActivity({
      section: "ventas",
      action: "eliminar",
      summary: rows[0].name,
      refId: rows[0].id,
    });
  }
  return rows[0] ?? null;
}

export async function listActivities(contactId: string) {
  const db = getDb();
  return db
    .select()
    .from(contactActivities)
    .where(eq(contactActivities.contactId, contactId))
    .orderBy(desc(contactActivities.happenedAt));
}

export function parseActivityInput(body: unknown):
  | { ok: true; value: { type: string; summary: string; happenedAt: Date } }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const type = String(b.type ?? "nota");
  if (!TYPES.has(type as "nota")) return { ok: false, error: "Tipo no válido." };
  const summary = String(b.summary ?? "").trim();
  if (!summary) return { ok: false, error: "Escribe qué pasó." };
  let happenedAt = new Date();
  if (b.happenedAt) {
    const raw = String(b.happenedAt);
    if (isISODate(raw)) happenedAt = new Date(`${raw}T12:00:00-05:00`);
    else {
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) return { ok: false, error: "La fecha no es válida." };
      happenedAt = parsed;
    }
  }
  return { ok: true, value: { type, summary: summary.slice(0, 500), happenedAt } };
}

export async function addActivity(contactId: string, input: { type: string; summary: string; happenedAt: Date }) {
  const db = getDb();
  const rows = await db.insert(contactActivities).values({ contactId, ...input }).returning();
  const activity = rows[0];
  await logActivity({
    section: "ventas",
    action: input.type,
    summary: input.summary,
    refId: contactId,
  });
  return activity;
}

export async function salesSnapshot(projectId: string) {
  const db = getDb();
  const today = todayISO();
  const { from, to } = monthRange(today.slice(0, 7));
  const open = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(contacts)
    .where(
      and(
        eq(contacts.projectId, projectId),
        lte(contacts.nextActionDate, today),
        sql`${contacts.stage} not in ('ganado', 'perdido')`
      )
    );
  const monthStart = new Date(`${from}T00:00:00-05:00`);
  const monthEnd = new Date(`${to}T23:59:59-05:00`);
  const meetings = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(contactActivities)
    .innerJoin(contacts, eq(contacts.id, contactActivities.contactId))
    .where(
      and(
        eq(contacts.projectId, projectId),
        eq(contactActivities.type, "reunion"),
        gte(contactActivities.happenedAt, monthStart),
        lte(contactActivities.happenedAt, monthEnd)
      )
    );
  const closed = await db
    .select({
      total: sql<string>`coalesce(sum(${contacts.value}), 0)::text`,
    })
    .from(contacts)
    .where(
      and(
        eq(contacts.projectId, projectId),
        eq(contacts.stage, "ganado"),
        gte(contacts.wonAt, monthStart),
        lte(contacts.wonAt, monthEnd)
      )
    );
  return {
    toAnswer: open[0]?.n ?? 0,
    meetings: meetings[0]?.n ?? 0,
    closed: closed[0]?.total ?? "0",
  };
}
