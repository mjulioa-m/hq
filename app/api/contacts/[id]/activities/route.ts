import { NextResponse } from "next/server";
import { addActivity, listActivities, parseActivityInput } from "@/lib/contacts";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    return NextResponse.json({ items: await listActivities(id) });
  });
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const parsed = parseActivityInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await addActivity(id, parsed.value);
    return NextResponse.json({ item });
  });
}
