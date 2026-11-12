import { NextResponse } from "next/server";
import { createEntry, listEntries, parseFinanceInput } from "@/lib/finance";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const url = new URL(request.url);
    const items = await listEntries({
      projectId: url.searchParams.get("projectId"),
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
    });
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const parsed = parseFinanceInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createEntry(parsed.value);
    return NextResponse.json({ item });
  });
}
