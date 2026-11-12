import { readFile, stat } from "fs/promises";
import { NextResponse } from "next/server";
import { catchAuth, requireSession } from "@/lib/session";
import { contentTypeFor, resolveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return catchAuth(async () => {
    await requireSession();
    const { path: parts } = await ctx.params;
    const target = resolveUpload(parts);
    if (!target) return NextResponse.json({ error: "Ruta no válida." }, { status: 400 });
    try {
      const info = await stat(target);
      const type = contentTypeFor(target);
      const range = request.headers.get("range");
      if (range && type.startsWith("video/")) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) return new NextResponse(null, { status: 416 });
        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Number(match[2]) : info.size - 1;
        if (start >= info.size || end >= info.size || start > end) {
          return new NextResponse(null, { status: 416, headers: { "content-range": `bytes */${info.size}` } });
        }
        const bytes = await readFile(target);
        const chunk = bytes.subarray(start, end + 1);
        return new NextResponse(chunk, {
          status: 206,
          headers: {
            "content-type": type,
            "content-range": `bytes ${start}-${end}/${info.size}`,
            "accept-ranges": "bytes",
            "content-length": String(chunk.length),
            "cache-control": "private, max-age=3600",
          },
        });
      }
      const bytes = await readFile(target);
      return new NextResponse(new Uint8Array(bytes), {
        headers: {
          "content-type": type,
          "accept-ranges": "bytes",
          "content-length": String(info.size),
          "cache-control": "private, max-age=3600",
        },
      });
    } catch {
      return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
    }
  });
}
