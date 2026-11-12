import { NextResponse } from "next/server";
import { parsePressureInput, savePressure } from "@/lib/pressure";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const parsed = parsePressureInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await savePressure(parsed.value);
    return NextResponse.json({ item });
  });
}
