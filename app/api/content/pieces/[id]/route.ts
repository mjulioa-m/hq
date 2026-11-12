import { NextResponse } from "next/server";
import { deletePiece, updatePiece } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const item = await updatePiece(id, {
      title: body.title,
      status: body.status,
      currentStage: body.currentStage,
      publishedUrl: body.publishedUrl,
      plannedDate: body.plannedDate,
      metrics: body.metrics,
      projectId: body.projectId,
      format: body.format,
    });
    if (!item) return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deletePiece(id);
    if (!removed) return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
