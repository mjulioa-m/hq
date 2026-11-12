import { NextResponse } from "next/server";
import { catchAuth, requireSession } from "@/lib/session";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return catchAuth(async () => {
    await requireSession();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
    const saved = await saveUpload(file);
    if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: 400 });
    return NextResponse.json(saved);
  });
}
