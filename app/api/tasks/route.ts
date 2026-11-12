import { NextResponse } from "next/server";
import { catchAuth, requireAccess } from "@/lib/session";
import { createTask, listTasks, parseTaskInput } from "@/lib/tasks";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireAccess(request);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const includeDone = url.searchParams.get("includeDone") !== "0";
    const items = await listTasks({ projectId, includeDone });
    return NextResponse.json({ items });
  });
}

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireAccess(request);
    const body = await request.json().catch(() => ({}));
    const parsed = parseTaskInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const item = await createTask(parsed.value);
    return NextResponse.json({ item });
  });
}
