import { NextResponse } from "next/server";
import { createReminder, listReminders, parseReminderInput } from "@/lib/reminders";
import { catchAuth, requireAccess } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireAccess(request);
    const items = await listReminders();
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireAccess(request);
    const body = await request.json().catch(() => ({}));
    const parsed = parseReminderInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createReminder(parsed.value);
    return NextResponse.json({ item });
  });
}
