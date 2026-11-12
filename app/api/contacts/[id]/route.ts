import { NextResponse } from "next/server";
import { deleteContact, parseContactInput, updateContact } from "@/lib/contacts";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    if (Object.keys(body).length === 1 && body.stage) {
      const item = await updateContact(id, { stage: String(body.stage) });
      if (!item) return NextResponse.json({ error: "Contacto no encontrado." }, { status: 404 });
      return NextResponse.json({ item });
    }
    const parsed = parseContactInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await updateContact(id, parsed.value);
    if (!item) return NextResponse.json({ error: "Contacto no encontrado." }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const removed = await deleteContact(id);
    if (!removed) return NextResponse.json({ error: "Contacto no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
