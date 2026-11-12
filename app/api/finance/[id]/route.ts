import { NextResponse } from "next/server";
import { deleteEntry, parseFinanceInput, updateEntry } from "@/lib/finance";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const parsed = parseFinanceInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await updateEntry(id, parsed.value);
    if (!item) return NextResponse.json({ error: "Movimiento no encontrado." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deleteEntry(id);
    if (!removed) return NextResponse.json({ error: "Movimiento no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
