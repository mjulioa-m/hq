import { NextResponse } from "next/server";
import { deleteLearning, parseLearningInput, updateLearning } from "@/lib/learnings";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const parsed = parseLearningInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await updateLearning(id, parsed.value);
    if (!item) return NextResponse.json({ error: "Nota no encontrada." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deleteLearning(id);
    if (!removed) return NextResponse.json({ error: "Nota no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
