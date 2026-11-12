import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const publicPrefixes = ["/login", "/api/auth"];
  const isPublic = publicPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isPublic) return NextResponse.next();

  if (!isLoggedIn) {
    const bearer = req.headers.get("authorization")?.startsWith("Bearer ") ?? false;
    const tokenApi =
      pathname === "/api/tasks" ||
      pathname.startsWith("/api/tasks/") ||
      pathname === "/api/reminders" ||
      pathname.startsWith("/api/reminders/") ||
      pathname === "/api/projects";
    if (bearer && tokenApi) return NextResponse.next();
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|scenes/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
