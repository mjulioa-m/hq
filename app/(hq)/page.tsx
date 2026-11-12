import { TodayDesk } from "@/components/home/TodayDesk";
import { WeekStrip } from "@/components/home/WeekStrip";
import { countDueReminders } from "@/lib/reminders";
import { todayISO, upcomingDays } from "@/lib/dates";
import { listProjects, resolveProjectId } from "@/lib/projects";
import { listTasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const projectId = await resolveProjectId(p);
  const [projects, tasks, reminders] = await Promise.all([
    listProjects(),
    listTasks({ projectId, includeDone: true }),
    countDueReminders(),
  ]);
  const today = todayISO();
  const byId = new Map(projects.map((project) => [project.id, project]));
  const decorate = (task: (typeof tasks)[number]) => {
    const project = task.projectId ? byId.get(task.projectId) : undefined;
    return {
      id: task.id,
      title: task.title,
      notes: task.notes,
      projectId: task.projectId,
      dueDate: task.dueDate,
      priority: task.priority,
      done: task.done,
      doneAt: task.doneAt,
      projectName: project?.name ?? null,
      projectColor: project?.color ?? null,
    };
  };
  const open = tasks.filter((task) => !task.done);
  const overdue = open.filter((task) => task.dueDate && task.dueDate < today).map(decorate);
  const todayTasks = open.filter((task) => task.dueDate === today).map(decorate);
  const doneToday = tasks.filter((task) => task.done && task.dueDate === today).length;
  const marked = new Set(tasks.map((task) => task.dueDate).filter((day): day is string => !!day));
  const week = upcomingDays(7, today).filter((day) => marked.has(day));
  const query = p ? `p=${encodeURIComponent(p)}` : "";

  return (
    <div>
      <TodayDesk
        projects={projects.map((project) => ({ id: project.id, name: project.name }))}
        defaultProjectId={projectId}
        overdue={overdue}
        todayTasks={todayTasks}
        doneToday={doneToday}
        reminders={reminders}
        tasksHref={query ? `/tareas?${query}` : "/tareas"}
        remindersHref="/recordatorios"
      />
      <div className="mt-4">
        <WeekStrip daysWithTasks={week} query={query} />
      </div>
    </div>
  );
}
