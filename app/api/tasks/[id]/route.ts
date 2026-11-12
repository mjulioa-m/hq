import { NextResponse } from "next/server";
import { catchAuth, requireAccess } from "@/lib/session";
import { deleteTask, parseTaskInput, updateTask } from "@/lib/tasks";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireAccess(request);
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const patch: { done?: boolean; title?: string; notes?: string; projectId?: string | null; dueDate?: string | null; priority?: string } = {};
    if (body.done !== undefined) patch.done = Boolean(body.done);
    const hasFields = ["title", "notes", "projectId", "dueDate", "priority"].some((k) => body[k] !== undefined);
    if (hasFields) {
      const parsed = parseTaskInput({
        title: body.title ?? "x",
        notes: body.notes,
        projectId: body.projectId,
        dueDate: body.dueDate,
        priority: body.priority,
      });
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
      if (body.title !== undefined) patch.title = parsed.value.title;
      if (body.notes !== undefined) patch.notes = parsed.value.notes;
      if (body.projectId !== undefined) patch.projectId = parsed.value.projectId;
      if (body.dueDate !== undefined) patch.dueDate = parsed.value.dueDate;
      if (body.priority !== undefined) patch.priority = parsed.value.priority;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
    }
    const item = await updateTask(id, patch);
    if (!item) return NextResponse.json({ error: "No está en las tareas." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireAccess(_request);
    const { id } = await ctx.params;
    const removed = await deleteTask(id);
    if (!removed) return NextResponse.json({ error: "No está en las tareas." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
