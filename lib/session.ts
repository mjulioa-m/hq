import { timingSafeEqual } from "crypto";
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "No autenticado." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return session;
}

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return match?.[1] ?? "";
}

export function hasValidApiToken(request: Request) {
  const expected = process.env.HQ_API_TOKEN?.trim() ?? "";
  const given = bearerToken(request);
  if (!expected || !given || expected.length !== given.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

export async function requireAccess(request: Request) {
  if (hasValidApiToken(request)) return;
  await requireSession();
}

export async function catchAuth(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: "Error interno." }, { status: 500 });
  }
}
