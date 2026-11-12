import Link from "next/link";
import { redirect } from "next/navigation";
import { SceneHero, SceneThumb } from "@/components/scene/SceneHero";
import { salesSnapshot } from "@/lib/contacts";
import { formatCOP } from "@/lib/money";
import { listProjects } from "@/lib/projects";
import { SALES_PROJECTS, SHOW_SALES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function VentasPage() {
  if (!SHOW_SALES) redirect("/");
  const projects = (await listProjects()).filter((p) => (SALES_PROJECTS as readonly string[]).includes(p.slug));
  const cards = await Promise.all(projects.map(async (project) => ({ project, snap: await salesSnapshot(project.id) })));
  return (
    <div>
      <SceneHero scene="ventas" title="Ventas" subtitle="Contactos, reuniones y lo que ya cerró." />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {cards.map(({ project, snap }) => (
          <Link key={project.id} href={`/ventas/${project.slug}`} className="glass overflow-hidden">
            <SceneThumb scene={project.sceneSlug} className="h-36" />
            <div className="p-4">
              <h2 className="display text-2xl">{project.name}</h2>
              <p className="mt-1 text-sm text-ink-2">{project.description}</p>
              <dl className="mt-4 grid grid-cols-3 text-center text-xs text-ink-3">
                <div>
                  <dt>Por responder</dt>
                  <dd className="text-lg text-ink">{snap.toAnswer}</dd>
                </div>
                <div>
                  <dt>Reuniones</dt>
                  <dd className="text-lg text-ink">{snap.meetings}</dd>
                </div>
                <div>
                  <dt>Cerrado</dt>
                  <dd className="text-lg text-ink">{formatCOP(snap.closed)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-right text-sm text-accent">Entrar →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
