import { NextResponse } from "next/server";
import { completeStage, saveStageNote } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PUT(request: Request, ctx: { params: Promise<{ id: string; stage: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id, stage } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const note = await saveStageNote(id, stage, String(body.content ?? "").slice(0, 20000));
    return NextResponse.json({ note });
  });
}

export async function POST(_request: Request, ctx: { params: Promise<{ id: string; stage: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id, stage } = await ctx.params;
    const piece = await completeStage(id, decodeURIComponent(stage));
    if (!piece) return NextResponse.json({ error: "No se pudo cerrar la fase." }, { status: 404 });
    return NextResponse.json({ piece });
  });
}
