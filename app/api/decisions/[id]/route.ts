import { NextResponse } from "next/server";
import { deleteDecision, parseDecisionInput, updateDecision } from "@/lib/decisions";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const patch: { status?: string; outcome?: string; title?: string; context?: string; options?: string[]; dueDate?: string | null; projectId?: string | null } = {};
    if (body.status !== undefined) patch.status = String(body.status);
    if (body.outcome !== undefined) patch.outcome = String(body.outcome);
    if (body.title !== undefined || body.context !== undefined || body.options !== undefined) {
      const parsed = parseDecisionInput({
        title: body.title ?? "x",
        context: body.context,
        options: body.options,
        dueDate: body.dueDate,
        projectId: body.projectId,
      });
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
      if (body.title !== undefined) patch.title = parsed.value.title;
      if (body.context !== undefined) patch.context = parsed.value.context;
      if (body.options !== undefined) patch.options = parsed.value.options;
      if (body.dueDate !== undefined) patch.dueDate = parsed.value.dueDate;
      if (body.projectId !== undefined) patch.projectId = parsed.value.projectId;
    }
    const item = await updateDecision(id, patch);
    if (!item) return NextResponse.json({ error: "Decisión no encontrada." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deleteDecision(id);
    if (!removed) return NextResponse.json({ error: "Decisión no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
