import Link from "next/link";
import { SceneThumb } from "@/components/scene/SceneHero";
import { SceneHero } from "@/components/scene/SceneHero";
import { projectPulse } from "@/lib/dashboard";
import { SHOW_FINANCE } from "@/lib/constants";
import { listProjects } from "@/lib/projects";
import { formatCOP } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const projects = (await listProjects()).filter((p) => !p.archived);
  const pulses = await Promise.all(projects.map(async (p) => ({ project: p, pulse: await projectPulse(p.id) })));
  return (
    <div>
      <SceneHero scene="proyectos" title="Proyectos" subtitle="Trabajo, casa, estudio y lo personal." />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {pulses.map(({ project, pulse }) => (
          <Link key={project.id} href={`/proyectos/${project.slug}`} className="glass overflow-hidden">
            <SceneThumb scene={project.sceneSlug} className="h-36" />
            <div className="p-4">
              <h2 className="display text-2xl" style={{ color: project.color }}>
                {project.name}
              </h2>
              <p className="mt-1 text-sm text-ink-2">{project.description}</p>
              <dl className={`mt-4 grid gap-2 text-center text-xs text-ink-3 ${SHOW_FINANCE ? "grid-cols-3" : "grid-cols-2"}`}>
                <div>
                  <dt>Tareas</dt>
                  <dd className="text-base text-ink">{pulse.openTasks}</dd>
                </div>
                <div>
                  <dt>Contenido</dt>
                  <dd className="text-base text-ink">{pulse.pieces}</dd>
                </div>
                {SHOW_FINANCE ? (
                  <div>
                    <dt>Mes</dt>
                    <dd className="text-base text-ink">{formatCOP(pulse.balance)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
