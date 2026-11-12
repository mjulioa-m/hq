import { NextResponse } from "next/server";
import { listProjects } from "@/lib/projects";
import { catchAuth, requireAccess } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return catchAuth(async () => {
    await requireAccess(request);
    const items = await listProjects();
    return NextResponse.json({
      items: items.map((project) => ({
        id: project.id,
        slug: project.slug,
        name: project.name,
      })),
    });
  });
}
