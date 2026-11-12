import { CheckSquare } from "lucide-react";
import Link from "next/link";
import { TaskBacklog } from "@/components/tasks/TaskBacklog";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { SceneHero } from "@/components/scene/SceneHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { addDays, dayRelationLabel, formatLong, formatShort, isISODate, todayISO } from "@/lib/dates";
import { listProjects, resolveProjectId } from "@/lib/projects";
import { listTasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function TareasPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; d?: string; vista?: string }>;
}) {
  const sp = await searchParams;
  const today = todayISO();
  const focus = sp.d && isISODate(sp.d) ? sp.d : today;
  const projectId = await resolveProjectId(sp.p);
  const projects = await listProjects();
  const tasks = await listTasks({ projectId, includeDone: true });
  const byId = new Map(projects.map((p) => [p.id, p]));
  const decorate = (task: (typeof tasks)[number]) => {
    const project = task.projectId ? byId.get(task.projectId) : undefined;
    return { ...task, projectName: project?.name ?? null, projectColor: project?.color ?? null };
  };
  const open = tasks.filter((t) => !t.done).map(decorate);
  const undated = open.filter((t) => !t.dueDate);
  const done = tasks
    .filter((t) => t.done)
    .map(decorate)
    .sort((a, b) => {
      const at = a.doneAt ? new Date(a.doneAt).getTime() : 0;
      const bt = b.doneAt ? new Date(b.doneAt).getTime() : 0;
      return bt - at;
    });
  const overdue = open.filter((t) => t.dueDate && t.dueDate < today);
  const forFocus = open.filter((t) => t.dueDate === focus);
  const doneToday = tasks.filter((t) => t.done && t.dueDate === focus);
  const query = sp.p ? `p=${encodeURIComponent(sp.p)}` : "";

  const upcoming = Array.from({ length: 7 }, (_, i) => addDays(focus, i + 1)).map((iso) => {
    const dayTasks = open.filter((t) => t.dueDate === iso);
    return { iso, tasks: dayTasks };
  });

  return (
    <div>
      <SceneHero scene="tareas" title="Tareas diarias" subtitle={formatLong(focus)} />
      <div className="mt-4">
        <TaskQuickAdd
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          defaultProjectId={projectId}
        />
      </div>
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Todavía no tienes tareas"
          description="Apunta la primera arriba o pégale tu lista a Cursor."
        />
      ) : sp.vista === "todas" ? (
        <TaskBacklog tasks={tasks.map(decorate)} projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="glass p-4">
            <header className="mb-3 flex items-baseline justify-between">
              <h2 className="display text-xl">{focus === today ? "Hoy" : formatLong(focus)}</h2>
              <span className="text-xs text-ink-3">
                {doneToday.length} de {doneToday.length + forFocus.length} hechas
              </span>
            </header>
            <TaskList
              projects={projects.map((p) => ({ id: p.id, name: p.name }))}
              groups={
                focus === today
                  ? [
                      { label: "ATRASADAS", tone: "danger", tasks: overdue },
                      { label: "PARA HOY", tasks: forFocus },
                    ]
                  : [{ label: dayRelationLabel(focus, today).toUpperCase(), tasks: forFocus }]
              }
            />
          </section>
          <section className="glass p-4">
            <header className="mb-3 flex items-baseline justify-between">
              <h2 className="display text-xl">Próximos 7 días</h2>
              <span className="text-xs text-ink-3">
                {upcoming.reduce((n, d) => n + d.tasks.length, 0)} tareas
              </span>
            </header>
            <TaskList
              projects={projects.map((p) => ({ id: p.id, name: p.name }))}
              groups={upcoming
                .filter((d) => d.tasks.length > 0)
                .map((d) => ({
                  label: `${dayRelationLabel(d.iso, today)} ${formatShort(d.iso)}`,
                  loaded: d.tasks.length >= 5,
                  tasks: d.tasks,
                }))}
            />
          </section>
        </div>
      )}
      {tasks.length > 0 && sp.vista !== "todas" && undated.length > 0 ? (
        <section id="pendientes" className="glass mt-4 scroll-mt-24 p-4">
          <header className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="display text-xl">Sin fecha</h2>
            <a href="#ya-listas" className="text-sm text-ink-2">
              Ya listas {done.length}
            </a>
          </header>
          <TaskList
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            groups={[{ label: "PENDIENTES", tasks: undated }]}
          />
        </section>
      ) : null}
      {tasks.length > 0 && sp.vista !== "todas" ? (
        <section id="ya-listas" className="glass mt-4 scroll-mt-24 p-4">
          <header className="mb-3">
            <h2 className="display text-xl">Ya listas</h2>
            <p className="text-sm text-ink-3">Las que marques con el círculo quedan aquí. Puedes reabrirlas.</p>
          </header>
          <TaskList
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            emptyLabel="Todavía no hay tareas listas."
            groups={[{ label: "HECHAS", tasks: done, reorderable: false }]}
          />
        </section>
      ) : null}
      <p className="mt-4 flex gap-4 text-sm text-ink-2">
        <Link href={`/diario/${today}${query ? `?${query}` : ""}`}>Diario de hoy</Link>
        <Link href={sp.vista === "todas" ? `/tareas${query ? `?${query}` : ""}` : `/tareas?vista=todas${query ? `&${query}` : ""}`}>
          {sp.vista === "todas" ? "Volver al día" : "Pendientes y listas"}
        </Link>
      </p>
    </div>
  );
}
