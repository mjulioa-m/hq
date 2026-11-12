import { NextResponse } from "next/server";
import { createLearning, listLearnings, parseLearningInput } from "@/lib/learnings";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const url = new URL(request.url);
    const items = await listLearnings({
      projectId: url.searchParams.get("projectId"),
      tag: url.searchParams.get("tag") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
    });
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const parsed = parseLearningInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createLearning(parsed.value);
    return NextResponse.json({ item });
  });
}
