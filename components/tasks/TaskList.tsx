"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TaskEditModal, type TaskShape } from "@/components/tasks/TaskEditModal";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { apiSend } from "@/lib/client-api";
import { formatShort } from "@/lib/dates";
import { useToast } from "@/components/ui/Toast";

export function TaskList({
  groups,
  projects,
  emptyLabel = "Nada pendiente.",
}: {
  groups: { label: string; tone?: "danger" | "neutral"; loaded?: boolean; reorderable?: boolean; tasks: (TaskShape & { projectName?: string | null; projectColor?: string | null })[] }[];
  projects: { id: string; name: string }[];
  emptyLabel?: string;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [editing, setEditing] = useState<TaskShape | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [order, setOrder] = useState(groups);
  const [orderFrom, setOrderFrom] = useState(groups);
  if (orderFrom !== groups) {
    setOrderFrom(groups);
    setOrder(groups);
  }
  const [moving, setMoving] = useState(false);

  async function toggle(task: TaskShape) {
    setPendingId(task.id);
    try {
      await apiSend(`/api/tasks/${task.id}`, "PATCH", { done: !task.done });
      notify({ tone: "ok", message: task.done ? "Tarea reabierta" : "Tarea lista" });
      router.refresh();
    } catch (error) {
      notify({ tone: "error", message: error instanceof Error ? error.message : "No se pudo guardar." });
    } finally {
      setPendingId(null);
    }
  }

  async function move(groupIndex: number, taskIndex: number, direction: -1 | 1) {
    const group = order[groupIndex];
    const nextIndex = taskIndex + direction;
    if (!group || nextIndex < 0 || nextIndex >= group.tasks.length || moving) return;
    const previous = order;
    const tasks = group.tasks.slice();
    const [item] = tasks.splice(taskIndex, 1);
    tasks.splice(nextIndex, 0, item);
    const next = order.map((entry, index) => (index === groupIndex ? { ...entry, tasks } : entry));
    setOrder(next);
    setMoving(true);
    try {
      await apiSend("/api/tasks/reorder", "POST", { ids: tasks.map((task) => task.id) });
      router.refresh();
    } catch (error) {
      setOrder(previous);
      notify({ tone: "error", message: error instanceof Error ? error.message : "No se pudo guardar el orden." });
    } finally {
      setMoving(false);
    }
  }

  return (
    <>
      <div className="space-y-5">
        {order.map((group, groupIndex) => (
          <section key={group.label}>
            <div className="mb-2 flex items-center gap-2">
              <h3 className={cn("text-xs font-semibold tracking-wide", group.tone === "danger" ? "text-danger" : "text-ink-3")}>
                {group.label}
              </h3>
              {group.loaded ? <Badge tone="hot">día cargado</Badge> : null}
            </div>
            <ul className="space-y-1">
              {group.tasks.length === 0 ? <li className="text-sm text-ink-3">{emptyLabel}</li> : null}
              {group.tasks.map((task, taskIndex) => (
                <li key={task.id} className="flex items-start gap-2 rounded-xl px-2 py-2 hover:bg-white/5">
                  <button
                    type="button"
                    aria-label={task.done ? `Reabrir «${task.title}»` : `Marcar «${task.title}» como lista`}
                    aria-busy={pendingId === task.id || undefined}
                    disabled={pendingId === task.id}
                    onClick={() => void toggle(task)}
                    className="grid h-11 w-11 shrink-0 place-items-center disabled:opacity-50"
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border text-xs",
                        task.done ? "border-accent bg-accent text-accent-ink" : "border-white/30"
                      )}
                    >
                      {task.done ? "✓" : ""}
                    </span>
                  </button>
                  <button type="button" onClick={() => setEditing(task)} className="min-w-0 flex-1 py-2 text-left">
                    <span className={cn("block break-words text-sm line-clamp-3", task.done && "task-done")}>{task.title}</span>
                    {task.notes ? <span className="mt-1 line-clamp-2 block text-xs whitespace-pre-line text-ink-3">{task.notes}</span> : null}
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-ink-3">{task.dueDate ? formatShort(task.dueDate) : "Sin fecha"}</span>
                      {task.priority === "alta" ? <Badge tone="danger">Alta</Badge> : null}
                      {task.projectName ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px]"
                          style={{ background: `${task.projectColor ?? "#fff"}33`, color: task.projectColor ?? "#fff" }}
                        >
                          {task.projectName}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  {group.reorderable !== false && group.tasks.length > 1 ? (
                    <div className="flex shrink-0">
                      <button
                        type="button"
                        aria-label={`Subir «${task.title}»`}
                        disabled={moving || taskIndex === 0}
                        onClick={() => void move(groupIndex, taskIndex, -1)}
                        className="grid h-11 w-11 place-items-center text-ink-2 disabled:opacity-30"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Bajar «${task.title}»`}
                        disabled={moving || taskIndex === group.tasks.length - 1}
                        onClick={() => void move(groupIndex, taskIndex, 1)}
                        className="grid h-11 w-11 place-items-center text-ink-2 disabled:opacity-30"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setEditing(task)} className="shrink-0 py-2 text-xs text-ink-2">
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <TaskEditModal key={editing?.id ?? "none"} task={editing} projects={projects} onClose={() => setEditing(null)} />
    </>
  );
}
