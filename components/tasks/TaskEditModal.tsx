"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { apiSend } from "@/lib/client-api";

export type TaskShape = {
  id: string;
  title: string;
  notes: string;
  projectId: string | null;
  dueDate: string | null;
  priority: string;
  done: boolean;
  doneAt?: Date | string | null;
};

export function TaskEditModal({
  task,
  projects,
  onClose,
}: {
  task: TaskShape | null;
  projects: { id: string; name: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [projectId, setProjectId] = useState(task?.projectId ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "normal");
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function validateTitle(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Escribe la tarea.";
    if (trimmed.length > 240) return "Máximo 240 caracteres.";
    return null;
  }

  async function save() {
    if (!task) return;
    const nextError = validateTitle(title);
    setTitleError(nextError);
    if (nextError) return;
    setPending(true);
    setError(null);
    try {
      await apiSend(`/api/tasks/${task.id}`, "PATCH", {
        title,
        notes,
        dueDate: dueDate || null,
        projectId: projectId || null,
        priority,
      });
      notify({ tone: "ok", message: "Cambios guardados" });
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!task) return;
    setPending(true);
    setError(null);
    try {
      await apiSend(`/api/tasks/${task.id}`, "DELETE");
      notify({ tone: "ok", message: "Tarea eliminada" });
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setPending(false);
    }
  }

  return (
    <>
      <Modal open={!!task && !confirming} title="Editar tarea" onClose={onClose}>
        <div className="space-y-3">
          <div>
            <Input
              data-autofocus
              value={title}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? "task-title-error" : undefined}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => setTitleError(validateTitle(title))}
            />
            {title.length > 200 ? <p className="mt-1 text-xs text-ink-3">{title.length}/240</p> : null}
            {titleError ? (
              <p id="task-title-error" className="mt-1 text-sm text-danger">
                {titleError}
              </p>
            ) : null}
          </div>
          <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas" />
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          <Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="">Sin área</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
          </Select>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-between gap-2">
            <Button tone="danger" onClick={() => setConfirming(true)}>
              Eliminar
            </Button>
            <Button loading={pending} disabled={titleError !== null} onClick={() => void save()}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="¿Eliminar esta tarea?"
        message={`Se borra «${task?.title ?? ""}» con sus notas. No se puede deshacer.`}
        confirmLabel="Eliminar tarea"
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => void remove()}
      />
    </>
  );
}
