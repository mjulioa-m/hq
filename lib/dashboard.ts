import { and, eq, sql } from "drizzle-orm";
import { SHOW_FINANCE, SHOW_SALES } from "@/lib/constants";
import { countPending } from "@/lib/decisions";
import { summarize, listEntries } from "@/lib/finance";
import { monthRange, todayISO } from "@/lib/dates";
import { formatCOP } from "@/lib/money";
import { getDb } from "@/lib/db";
import { contacts, contentPieces, learnings, tasks } from "@/lib/db/schema";
import { countDueReminders } from "@/lib/reminders";
import { countOpenUntil } from "@/lib/tasks";

export async function getDockCounts(projectId?: string | null) {
  const tasksOpen = await countOpenUntil(todayISO(), projectId);
  const decisions = await countPending(projectId);
  const reminders = await countDueReminders();
  return { tasks: tasksOpen, decisions, reminders };
}

export async function projectPulse(projectId: string) {
  const db = getDb();
  const openTasks = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.done, false)));
  const pieces = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(contentPieces)
    .where(and(eq(contentPieces.projectId, projectId), eq(contentPieces.status, "en_marcha")));
  const money = SHOW_FINANCE
    ? summarize(await listEntries({ projectId, ...monthRange(todayISO().slice(0, 7)) }))
    : null;
  return {
    openTasks: openTasks[0]?.n ?? 0,
    pieces: pieces[0]?.n ?? 0,
    balance: money?.balance ?? 0,
    balanceLabel: money ? formatCOP(money.balance) : "",
  };
}

export async function homeBadges(projectId?: string | null) {
  const db = getDb();
  const taskWhere = [eq(tasks.done, false)];
  const pieceWhere = [eq(contentPieces.status, "en_marcha")];
  const leadWhere = [sql`${contacts.stage} not in ('ganado', 'perdido')`, sql`${contacts.nextActionDate} <= ${todayISO()}`];
  if (projectId) {
    taskWhere.push(eq(tasks.projectId, projectId));
    pieceWhere.push(eq(contentPieces.projectId, projectId));
    leadWhere.push(eq(contacts.projectId, projectId));
  }
  const [taskRows, pieceRows, learningRows, pending] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(tasks).where(and(...taskWhere, sql`${tasks.dueDate} is not null and ${tasks.dueDate} <= ${todayISO()}`)),
    db.select({ n: sql<number>`count(*)::int` }).from(contentPieces).where(and(...pieceWhere)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(learnings)
      .where(projectId ? eq(learnings.projectId, projectId) : undefined),
    countPending(projectId),
  ]);
  const leadRows = SHOW_SALES
    ? await db.select({ n: sql<number>`count(*)::int` }).from(contacts).where(and(...leadWhere))
    : [];
  const money = SHOW_FINANCE
    ? summarize(await listEntries({ projectId, ...monthRange(todayISO().slice(0, 7)) }))
    : null;
  return {
    tasks: taskRows[0]?.n ?? 0,
    pieces: pieceRows[0]?.n ?? 0,
    leads: leadRows[0]?.n ?? 0,
    learnings: learningRows[0]?.n ?? 0,
    decisions: pending,
    balance: money ? formatCOP(money.balance) : "",
  };
}
