import { NextResponse } from "next/server";
import { createContact, listContacts, parseContactInput } from "@/lib/contacts";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const projectId = new URL(request.url).searchParams.get("projectId");
    return NextResponse.json({ items: await listContacts(projectId) });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const parsed = parseContactInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createContact(parsed.value);
    return NextResponse.json({ item });
  });
}
