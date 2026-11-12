import { getDb } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";

export async function logActivity(input: {
  actor?: "yo" | "ia";
  section: string;
  action: string;
  summary: string;
  refId?: string | null;
}) {
  const db = getDb();
  await db.insert(activityLog).values({
    actor: input.actor ?? "yo",
    section: input.section,
    action: input.action,
    summary: input.summary,
    refId: input.refId ?? null,
  });
}
