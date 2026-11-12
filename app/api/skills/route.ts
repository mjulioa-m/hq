import { NextResponse } from "next/server";
import { createSkill, listSkills, parseSkillInput } from "@/lib/skills";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const q = new URL(request.url).searchParams.get("q") ?? undefined;
    const items = await listSkills(q);
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const parsed = parseSkillInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createSkill(parsed.value);
    return NextResponse.json({ item });
  });
}
