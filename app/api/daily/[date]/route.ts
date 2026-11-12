import { NextResponse } from "next/server";
import { getDaily, parseDailyInput, saveDaily } from "@/lib/daily";
import { isISODate } from "@/lib/dates";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: { params: Promise<{ date: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { date } = await ctx.params;
    if (!isISODate(date)) return NextResponse.json({ error: "Fecha no válida." }, { status: 400 });
    return NextResponse.json({ note: await getDaily(date) });
  });
}

export async function PUT(request: Request, ctx: { params: Promise<{ date: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { date } = await ctx.params;
    if (!isISODate(date)) return NextResponse.json({ error: "Fecha no válida." }, { status: 400 });
    const body = await request.json().catch(() => ({}));
    const parsed = parseDailyInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const note = await saveDaily(date, parsed.value.content);
    return NextResponse.json({ note });
  });
}
