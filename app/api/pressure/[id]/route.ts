import { NextResponse } from "next/server";
import { deletePressure } from "@/lib/pressure";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deletePressure(id);
    if (!removed) return NextResponse.json({ error: "No está en el tamizaje." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
