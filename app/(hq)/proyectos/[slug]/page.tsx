import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/projects/ProjectEditor";
import { SceneHero } from "@/components/scene/SceneHero";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { SHOW_FINANCE } from "@/lib/constants";
import { formatCOP } from "@/lib/money";
import { monthRange, todayISO } from "@/lib/dates";
import { listPieces } from "@/lib/content";
import { listDecisions } from "@/lib/decisions";
import { listEntries, summarize } from "@/lib/finance";
import { getProjectBySlug, listProjects } from "@/lib/projects";
import { listTasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function ProyectoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const projects = await listProjects();
  const [openTasks, pieces, entries, decisions] = await Promise.all([
    listTasks({ projectId: project.id, includeDone: false }),
    listPieces({ projectId: project.id, status: "en_marcha" }),
    SHOW_FINANCE ? listEntries({ projectId: project.id, ...monthRange(todayISO().slice(0, 7)) }) : Promise.resolve([]),
    listDecisions({ projectId: project.id, status: "pendiente" }),
  ]);
  const money = SHOW_FINANCE ? summarize(entries) : null;
  return (
    <div>
      <SceneHero scene={project.sceneSlug} title={project.name} subtitle={project.description} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="glass p-4">
          <h2 className="mb-3 font-medium">Tareas abiertas</h2>
          <TaskQuickAdd projects={projects.map((p) => ({ id: p.id, name: p.name }))} defaultProjectId={project.id} />
          <ul className="space-y-1 text-sm">
            {openTasks.slice(0, 8).map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
            {openTasks.length === 0 ? <li className="text-ink-3">Nada abierto.</li> : null}
          </ul>
        </section>
        <section className="glass p-4">
          <h2 className="mb-3 font-medium">Contenido en marcha</h2>
          <ul className="space-y-2 text-sm">
            {pieces.slice(0, 8).map((piece) => (
              <li key={piece.id}>
                <Link href={`/contenido/pieza/${piece.id}`} className="text-accent">
                  {piece.title}
                </Link>
              </li>
            ))}
            {pieces.length === 0 ? <li className="text-ink-3">Sin piezas en marcha.</li> : null}
          </ul>
        </section>
        {money ? (
          <section className="glass p-4">
            <h2 className="mb-3 font-medium">Finanzas del mes</h2>
            <p className="text-sm text-ink-2">Ingresos {formatCOP(money.income)}</p>
            <p className="text-sm text-ink-2">Gastos {formatCOP(money.expense)}</p>
            <p className="mt-2 text-2xl">{formatCOP(money.balance)}</p>
          </section>
        ) : null}
        <section className="glass p-4 lg:col-span-2">
          <h2 className="mb-3 font-medium">Decisiones pendientes</h2>
          <ul className="space-y-2 text-sm">
            {decisions.map((d) => (
              <li key={d.id}>{d.title}</li>
            ))}
            {decisions.length === 0 ? <li className="text-ink-3">Nada por decidir.</li> : null}
          </ul>
        </section>
        <ProjectEditor project={project} />
      </div>
    </div>
  );
}
