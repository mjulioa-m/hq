import Link from "next/link";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { TaskList } from "@/components/tasks/TaskList";
import type { TaskShape } from "@/components/tasks/TaskEditModal";

type DeskTask = TaskShape & { projectName: string | null; projectColor: string | null };

export function TodayDesk({
  projects,
  defaultProjectId,
  overdue,
  todayTasks,
  doneToday,
  reminders,
  tasksHref,
  remindersHref,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId: string | null;
  overdue: DeskTask[];
  todayTasks: DeskTask[];
  doneToday: number;
  reminders: number;
  tasksHref: string;
  remindersHref: string;
}) {
  const overdueVisible = overdue.slice(0, 5);
  const todayVisible = todayTasks.slice(0, 5);
  const more = overdue.length > 5 || todayTasks.length > 5;
  const status =
    overdue.length > 0
      ? `Tienes ${overdue.length} atrasada${overdue.length === 1 ? "" : "s"}`
      : todayTasks.length > 0
        ? `${todayTasks.length} para hoy`
        : "Hoy está despejado";
  const groups = [
    ...(overdueVisible.length > 0 ? [{ label: "ATRASADAS", tone: "danger" as const, tasks: overdueVisible }] : []),
    ...(todayVisible.length > 0 ? [{ label: "PARA HOY", tasks: todayVisible }] : []),
  ];

  return (
    <div>
      <TaskQuickAdd projects={projects} defaultProjectId={defaultProjectId} compact />
      <p className="text-sm text-ink-2">{status}</p>
      {reminders > 0 ? (
        <Link href={remindersHref} className="mt-1 inline-block text-sm text-accent">
          Ver avisos
        </Link>
      ) : null}
      {groups.length > 0 ? (
        <section className="glass mt-4 p-4">
          <header className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="display text-xl">Hoy</h2>
            <span className="text-xs text-ink-3">
              {doneToday} de {doneToday + todayTasks.length} hechas
            </span>
          </header>
          <TaskList projects={projects} groups={groups} />
          {more ? (
            <Link href={tasksHref} className="mt-3 inline-block text-sm text-ink-2">
              Ver las demás en Tareas
            </Link>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
