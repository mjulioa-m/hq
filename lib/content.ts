import { and, desc, eq, gte, sql } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { isPlatform, nextStage, stagesFor } from "@/lib/content-stages";
import { addDays, isISODate, todayISO } from "@/lib/dates";
import { getDb } from "@/lib/db";
import {
  contentAssets,
  contentPieces,
  contentReferences,
  contentStageNotes,
} from "@/lib/db/schema";

const STATUSES = new Set(["en_marcha", "terminado", "publicado", "archivado"]);
const TAGS = new Set(["competencia", "busqueda", "audiencia", "inspiracion"]);
const FORMATS = new Set(["video", "reel", "short", "post", "carrusel", "historia"]);

export type PieceInput = {
  title: string;
  platform: string;
  format: string;
  projectId: string | null;
  plannedDate: string | null;
};

export function parsePieceInput(body: unknown):
  | { ok: true; value: PieceInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return { ok: false, error: "El título es obligatorio." };
  const platform = String(b.platform ?? "");
  if (!isPlatform(platform)) return { ok: false, error: "Plataforma no válida." };
  const format = String(b.format ?? defaultFormat(platform));
  if (!FORMATS.has(format)) return { ok: false, error: "Formato no válido." };
  let plannedDate: string | null = null;
  if (b.plannedDate) {
    plannedDate = String(b.plannedDate);
    if (!isISODate(plannedDate)) return { ok: false, error: "La fecha no es válida." };
  }
  return {
    ok: true,
    value: {
      title: title.slice(0, 240),
      platform,
      format,
      projectId: b.projectId ? String(b.projectId) : null,
      plannedDate,
    },
  };
}

function defaultFormat(platform: string) {
  if (platform === "instagram") return "reel";
  if (platform === "tiktok") return "short";
  if (platform === "linkedin" || platform === "facebook") return "post";
  return "video";
}

export async function listPieces(filter: {
  platform?: string;
  projectId?: string | null;
  status?: string;
}) {
  const db = getDb();
  const where = [];
  if (filter.platform) where.push(eq(contentPieces.platform, filter.platform));
  if (filter.projectId) where.push(eq(contentPieces.projectId, filter.projectId));
  if (filter.status) where.push(eq(contentPieces.status, filter.status));
  return db
    .select()
    .from(contentPieces)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(contentPieces.createdAt));
}

export async function getPiece(id: string) {
  const db = getDb();
  const rows = await db.select().from(contentPieces).where(eq(contentPieces.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createPiece(input: PieceInput) {
  const db = getDb();
  const rows = await db
    .insert(contentPieces)
    .values({ ...input, currentStage: "idea", status: "en_marcha" })
    .returning();
  const piece = rows[0];
  await logActivity({
    section: "contenido",
    action: "crear",
    summary: `Idea: ${piece.title}`,
    refId: piece.id,
  });
  return piece;
}

export async function updatePiece(
  id: string,
  patch: {
    title?: string;
    status?: string;
    currentStage?: string;
    publishedUrl?: string | null;
    plannedDate?: string | null;
    metrics?: {
      views?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      saves?: number;
    };
    projectId?: string | null;
    format?: string;
  }
) {
  const db = getDb();
  const current = await getPiece(id);
  if (!current) return null;
  if (patch.status && !STATUSES.has(patch.status)) return null;
  if (patch.currentStage && !stagesFor(current.platform).includes(patch.currentStage)) return null;
  const nextStatus = patch.status ?? current.status;
  const rows = await db
    .update(contentPieces)
    .set({
      ...patch,
      publishedAt:
        nextStatus === "publicado"
          ? current.publishedAt ?? new Date()
          : patch.status && patch.status !== "publicado"
            ? null
            : current.publishedAt,
    })
    .where(eq(contentPieces.id, id))
    .returning();
  const piece = rows[0] ?? null;
  if (piece) {
    await logActivity({
      section: "contenido",
      action: "actualizar",
      summary: piece.title,
      refId: piece.id,
    });
  }
  return piece;
}

export async function deletePiece(id: string) {
  const db = getDb();
  const rows = await db.delete(contentPieces).where(eq(contentPieces.id, id)).returning();
  if (rows[0]) {
    await logActivity({
      section: "contenido",
      action: "eliminar",
      summary: rows[0].title,
      refId: rows[0].id,
    });
  }
  return rows[0] ?? null;
}

export async function listStageNotes(pieceId: string) {
  const db = getDb();
  return db.select().from(contentStageNotes).where(eq(contentStageNotes.pieceId, pieceId));
}

export async function saveStageNote(pieceId: string, stage: string, content: string) {
  const db = getDb();
  const rows = await db
    .insert(contentStageNotes)
    .values({ pieceId, stage, content })
    .onConflictDoUpdate({
      target: [contentStageNotes.pieceId, contentStageNotes.stage],
      set: { content },
    })
    .returning();
  return rows[0] ?? null;
}

export async function completeStage(pieceId: string, stage: string) {
  const db = getDb();
  const piece = await getPiece(pieceId);
  if (!piece) return null;
  if (!stagesFor(piece.platform).includes(stage)) return null;
  await db
    .insert(contentStageNotes)
    .values({ pieceId, stage, content: "", done: true, doneAt: new Date() })
    .onConflictDoUpdate({
      target: [contentStageNotes.pieceId, contentStageNotes.stage],
      set: { done: true, doneAt: new Date() },
    });
  if (piece.currentStage === stage) {
    const stages = stagesFor(piece.platform);
    const isLast = stage === stages[stages.length - 1];
    const nxt = nextStage(piece.platform, stage);
    if (isLast || !nxt) {
      await db
        .update(contentPieces)
        .set({
          currentStage: stage,
          status: "publicado",
          publishedAt: new Date(),
        })
        .where(eq(contentPieces.id, pieceId));
    } else {
      await db
        .update(contentPieces)
        .set({ currentStage: nxt, status: piece.status === "archivado" ? "archivado" : "en_marcha" })
        .where(eq(contentPieces.id, pieceId));
    }
  }
  await logActivity({
    section: "contenido",
    action: "fase",
    summary: `${piece.title}: ${stage} hecha`,
    refId: pieceId,
  });
  return getPiece(pieceId);
}

export async function listAssets(pieceId: string) {
  const db = getDb();
  return db.select().from(contentAssets).where(eq(contentAssets.pieceId, pieceId));
}

export async function addAsset(input: {
  pieceId: string;
  stage: string;
  kind: string;
  label: string;
  url?: string | null;
  filePath?: string | null;
}) {
  const db = getDb();
  const rows = await db.insert(contentAssets).values(input).returning();
  return rows[0] ?? null;
}

export async function updateAsset(id: string, patch: { label?: string; isChosen?: boolean; stage?: string }) {
  const db = getDb();
  const current = await db.select().from(contentAssets).where(eq(contentAssets.id, id)).limit(1);
  if (!current[0]) return null;
  if (patch.isChosen) {
    await db
      .update(contentAssets)
      .set({ isChosen: false })
      .where(and(eq(contentAssets.pieceId, current[0].pieceId), eq(contentAssets.stage, current[0].stage)));
  }
  const rows = await db.update(contentAssets).set(patch).where(eq(contentAssets.id, id)).returning();
  return rows[0] ?? null;
}

export async function deleteAsset(id: string) {
  const db = getDb();
  const rows = await db.delete(contentAssets).where(eq(contentAssets.id, id)).returning();
  return rows[0] ?? null;
}

export type ReferenceInput = {
  platform: string;
  title: string;
  url: string;
  author: string;
  views: number | null;
  publishedOn: string | null;
  tag: string;
  notes: string;
  projectId: string | null;
};

export function parseReferenceInput(body: unknown):
  | { ok: true; value: ReferenceInput }
  | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const platform = String(b.platform ?? "");
  if (!isPlatform(platform)) return { ok: false, error: "Plataforma no válida." };
  const title = String(b.title ?? "").trim();
  if (!title) return { ok: false, error: "El título es obligatorio." };
  const tag = String(b.tag ?? "competencia");
  if (!TAGS.has(tag)) return { ok: false, error: "Etiqueta no válida." };
  let views: number | null = null;
  if (b.views !== undefined && b.views !== "" && b.views !== null) {
    views = Number(String(b.views).replace(/\./g, ""));
    if (!Number.isFinite(views) || views < 0) return { ok: false, error: "Las vistas no son válidas." };
  }
  let publishedOn: string | null = null;
  if (b.publishedOn) {
    publishedOn = String(b.publishedOn);
    if (!isISODate(publishedOn)) return { ok: false, error: "La fecha no es válida." };
  }
  return {
    ok: true,
    value: {
      platform,
      title: title.slice(0, 240),
      url: String(b.url ?? "").trim().slice(0, 500),
      author: String(b.author ?? "").trim().slice(0, 160),
      views,
      publishedOn,
      tag,
      notes: String(b.notes ?? "").trim().slice(0, 4000),
      projectId: b.projectId ? String(b.projectId) : null,
    },
  };
}

export async function enrichYoutube(url: string) {
  if (!url || !/youtu(\.be|be\.com)/i.test(url)) return null;
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; author_name?: string };
    return { title: data.title ?? "", author: data.author_name ?? "" };
  } catch {
    return null;
  }
}

export async function listReferences(filter: {
  platform: string;
  projectId?: string | null;
  tag?: string;
  since?: string | null;
}) {
  const db = getDb();
  const where = [eq(contentReferences.platform, filter.platform)];
  if (filter.projectId) where.push(eq(contentReferences.projectId, filter.projectId));
  if (filter.tag && filter.tag !== "todas") where.push(eq(contentReferences.tag, filter.tag));
  if (filter.since) where.push(gte(contentReferences.createdAt, new Date(`${filter.since}T00:00:00-05:00`)));
  return db
    .select()
    .from(contentReferences)
    .where(and(...where))
    .orderBy(desc(contentReferences.createdAt));
}

export async function createReference(input: ReferenceInput) {
  let title = input.title;
  let author = input.author;
  if (input.platform === "youtube" && input.url) {
    const extra = await enrichYoutube(input.url);
    if (extra) {
      if (!title || title === input.url) title = extra.title || title;
      if (!author) author = extra.author;
    }
  }
  const db = getDb();
  const rows = await db.insert(contentReferences).values({ ...input, title, author }).returning();
  const ref = rows[0];
  await logActivity({
    section: "contenido",
    action: "referencia",
    summary: ref.title,
    refId: ref.id,
  });
  return ref;
}

export async function updateReference(
  id: string,
  patch: { useful?: boolean | null; title?: string; notes?: string; tag?: string }
) {
  const db = getDb();
  const rows = await db
    .update(contentReferences)
    .set(patch)
    .where(eq(contentReferences.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteReference(id: string) {
  const db = getDb();
  const rows = await db.delete(contentReferences).where(eq(contentReferences.id, id)).returning();
  return rows[0] ?? null;
}

export async function convertReferenceToIdea(id: string) {
  const db = getDb();
  const rows = await db.select().from(contentReferences).where(eq(contentReferences.id, id)).limit(1);
  const ref = rows[0];
  if (!ref) return null;
  const piece = await createPiece({
    title: ref.title,
    platform: ref.platform,
    format: defaultFormat(ref.platform),
    projectId: ref.projectId,
    plannedDate: null,
  });
  if (ref.notes || ref.url) {
    await saveStageNote(piece.id, "idea", [ref.url, ref.notes].filter(Boolean).join("\n\n"));
  }
  await updateReference(id, { useful: true });
  return piece;
}

export async function platformCounts(platform: string, projectId?: string | null) {
  const pieces = await listPieces({ platform, projectId: projectId ?? undefined });
  const ideas = pieces.filter((p) => p.currentStage === "idea" && p.status === "en_marcha").length;
  const active = pieces.filter((p) => p.status === "en_marcha" && p.currentStage !== "idea").length;
  const published = pieces.filter((p) => p.status === "publicado").length;
  const inProgress = pieces.filter((p) => p.status === "en_marcha").length;
  return { ideas, active, published, inProgress, total: pieces.length };
}

export async function referenceFunnel(platform: string, projectId?: string | null, since?: string | null) {
  const refs = await listReferences({ platform, projectId, since });
  const today = todayISO();
  const captado = refs.length;
  const captadoHoy = refs.filter((r) => {
    const created = r.createdAt.toISOString().slice(0, 10);
    return created === today;
  }).length;
  const revisado = refs.filter((r) => r.useful !== null && r.useful !== undefined).length;
  const util = refs.filter((r) => r.useful === true).length;
  const descartado = refs.filter((r) => r.useful === false).length;
  const pieces = await listPieces({ platform, projectId: projectId ?? undefined });
  const ideas = pieces.filter((p) => p.currentStage === "idea" && p.status === "en_marcha").length;
  const enMarcha = pieces.filter((p) => p.status === "en_marcha" && p.currentStage !== "idea").length;
  return { captado, captadoHoy, revisado, util, descartado, ideas, enMarcha };
}

export async function publishedByMonth(platform: string, projectId?: string | null) {
  const db = getDb();
  const where = [eq(contentPieces.platform, platform), eq(contentPieces.status, "publicado")];
  if (projectId) where.push(eq(contentPieces.projectId, projectId));
  const rows = await db
    .select({
      ym: sql<string>`to_char(${contentPieces.publishedAt} AT TIME ZONE 'America/Bogota', 'YYYY-MM')`,
      n: sql<number>`count(*)::int`,
      views: sql<number>`coalesce(sum((${contentPieces.metrics}->>'views')::int), 0)::int`,
    })
    .from(contentPieces)
    .where(and(...where))
    .groupBy(sql`1`)
    .orderBy(sql`1`);
  return rows;
}

export function sinceFromRange(range?: string | null) {
  if (range === "7") return addDays(todayISO(), -7);
  if (range === "30") return addDays(todayISO(), -30);
  return null;
}
