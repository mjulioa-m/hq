import { NextResponse } from "next/server";
import { createReference, listReferences, parseReferenceInput } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform");
    if (!platform) return NextResponse.json({ error: "Falta la plataforma." }, { status: 400 });
    const items = await listReferences({
      platform,
      projectId: url.searchParams.get("projectId"),
      tag: url.searchParams.get("tag") ?? undefined,
    });
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const parsed = parseReferenceInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createReference(parsed.value);
    return NextResponse.json({ item });
  });
}
