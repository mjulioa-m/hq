import { NextResponse } from "next/server";
import { deleteReference, updateReference } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const item = await updateReference(id, {
      useful: body.useful,
      title: body.title,
      notes: body.notes,
      tag: body.tag,
    });
    if (!item) return NextResponse.json({ error: "Referencia no encontrada." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deleteReference(id);
    if (!removed) return NextResponse.json({ error: "Referencia no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
