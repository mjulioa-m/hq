import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { auth } from "@/lib/auth";
import { getDockCounts } from "@/lib/dashboard";
import { listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HqLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const projects = await listProjects();
  const counts = await getDockCounts();
  return (
    <AppShell
      projects={projects.filter((p) => !p.archived).map((p) => ({ slug: p.slug, name: p.name, color: p.color }))}
      counts={counts}
    >
      {children}
    </AppShell>
  );
}
