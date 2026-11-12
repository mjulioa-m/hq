import { NextResponse } from "next/server";
import { parseProjectPatch, updateProject } from "@/lib/projects";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const parsed = parseProjectPatch(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const project = await updateProject(id, parsed.value);
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    return NextResponse.json({ project });
  });
}
