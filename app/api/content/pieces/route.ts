import { NextResponse } from "next/server";
import { createPiece, listPieces, parsePieceInput } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const url = new URL(request.url);
    const items = await listPieces({
      platform: url.searchParams.get("platform") ?? undefined,
      projectId: url.searchParams.get("projectId"),
      status: url.searchParams.get("status") ?? undefined,
    });
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const parsed = parsePieceInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createPiece(parsed.value);
    return NextResponse.json({ item });
  });
}
