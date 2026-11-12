import { NextResponse } from "next/server";
import { catchAuth, requireAccess } from "@/lib/session";
import { reorderTasks } from "@/lib/tasks";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireAccess(request);
    const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string" || !id)) {
      return NextResponse.json({ error: "El orden no es válido." }, { status: 400 });
    }
    const result = await reorderTasks(body.ids);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  });
}
