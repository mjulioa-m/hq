import { NextResponse } from "next/server";
import { completeReminder, deleteReminder, parseReminderInput, updateReminder } from "@/lib/reminders";
import { catchAuth, requireAccess } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireAccess(request);
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    if (body.done === true) {
      const item = await completeReminder(id);
      if (!item) return NextResponse.json({ error: "No está en los recordatorios." }, { status: 404 });
      return NextResponse.json({ item });
    }
    const parsed = parseReminderInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await updateReminder(id, parsed.value);
    if (!item) return NextResponse.json({ error: "No está en los recordatorios." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireAccess(_request);
    const { id } = await ctx.params;
    const removed = await deleteReminder(id);
    if (!removed) return NextResponse.json({ error: "No está en los recordatorios." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
