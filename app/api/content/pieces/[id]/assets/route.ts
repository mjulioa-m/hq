import { NextResponse } from "next/server";
import { addAsset } from "@/lib/content";
import { catchAuth, requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const kind = String(body.kind ?? "");
    if (kind !== "imagen" && kind !== "video" && kind !== "enlace" && kind !== "archivo") {
      return NextResponse.json({ error: "Tipo de archivo no válido." }, { status: 400 });
    }
    const stage = String(body.stage ?? "");
    if (!stage) return NextResponse.json({ error: "Falta la fase." }, { status: 400 });
    const asset = await addAsset({
      pieceId: id,
      stage,
      kind,
      label: String(body.label ?? "").slice(0, 200),
      url: body.url ? String(body.url) : null,
      filePath: body.filePath ? String(body.filePath) : null,
    });
    return NextResponse.json({ asset });
  });
}
