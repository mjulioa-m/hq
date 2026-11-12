import { TaskList } from "@/components/tasks/TaskList";
import type { TaskShape } from "@/components/tasks/TaskEditModal";

type Row = TaskShape & { projectName?: string | null; projectColor?: string | null };

export function TaskBacklog({
  tasks,
  projects,
}: {
  tasks: Row[];
  projects: { id: string; name: string }[];
}) {
  const open = tasks.filter((task) => !task.done);
  const done = tasks
    .filter((task) => task.done)
    .sort((a, b) => {
      const at = a.doneAt ? new Date(a.doneAt).getTime() : 0;
      const bt = b.doneAt ? new Date(b.doneAt).getTime() : 0;
      return bt - at;
    });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <a href="#pendientes" className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm text-accent-ink">
          Pendientes {open.length}
        </a>
        <a href="#ya-listas" className="inline-flex h-10 items-center rounded-full bg-white/8 px-4 text-sm text-ink-2">
          Ya listas {done.length}
        </a>
      </div>
      <section id="pendientes" className="glass scroll-mt-24 p-4">
        <header className="mb-3">
          <h2 className="display text-xl">Pendientes</h2>
        </header>
        <TaskList
          projects={projects}
          emptyLabel="No hay pendientes."
          groups={[{ label: "POR HACER", tasks: open }]}
        />
      </section>
      <section id="ya-listas" className="glass scroll-mt-24 p-4">
        <header className="mb-3">
          <h2 className="display text-xl">Ya listas</h2>
          <p className="text-sm text-ink-3">Las que marques con el círculo quedan aquí. Puedes reabrirlas.</p>
        </header>
        <TaskList
          projects={projects}
          emptyLabel="Todavía no hay tareas listas."
          groups={[{ label: "HECHAS", tasks: done, reorderable: false }]}
        />
      </section>
    </div>
  );
}
