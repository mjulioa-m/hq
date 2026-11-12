import { NextResponse } from "next/server";
import { convertReferenceToIdea } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const piece = await convertReferenceToIdea(id);
    if (!piece) return NextResponse.json({ error: "Referencia no encontrada." }, { status: 404 });
    return NextResponse.json({ piece });
  });
}
