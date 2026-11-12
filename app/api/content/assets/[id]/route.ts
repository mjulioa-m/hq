import { NextResponse } from "next/server";
import { deleteAsset, updateAsset } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const asset = await updateAsset(id, {
      label: body.label,
      isChosen: body.isChosen,
      stage: body.stage,
    });
    if (!asset) return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
    return NextResponse.json({ asset });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deleteAsset(id);
    if (!removed) return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
