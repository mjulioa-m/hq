"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { addDays, todayISO } from "@/lib/dates";
import { apiSend } from "@/lib/client-api";
import { useToast } from "@/components/ui/Toast";

export function TaskQuickAdd({
  projects,
  defaultProjectId,
  compact = false,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId?: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const today = todayISO();
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("hoy");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [projectFrom, setProjectFrom] = useState(defaultProjectId);
  if (projectFrom !== defaultProjectId) {
    setProjectFrom(defaultProjectId);
    setProjectId(defaultProjectId ?? "");
  }
  const [priority, setPriority] = useState("normal");
  const [custom, setCustom] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    let dueDate: string | null = today;
    let sendProject: string | null = projectId || null;
    let sendPriority = priority;
    if (compact) {
      dueDate = today;
      sendProject = defaultProjectId || null;
      sendPriority = "normal";
    } else {
      if (when === "manana") dueDate = addDays(today, 1);
      if (when === "semana") dueDate = addDays(today, 6);
      if (when === "sin") dueDate = null;
      if (when === "fecha") dueDate = custom;
    }
    try {
      await apiSend("/api/tasks", "POST", {
        title,
        projectId: sendProject,
        priority: sendPriority,
        dueDate,
      });
      setTitle("");
      notify({ tone: "ok", message: "Tarea creada" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="glass mb-4 flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Apunta una tarea… (p. ej. Llamar a Marta)"
        className="w-full sm:min-w-[220px] sm:flex-1"
      />
      {compact ? null : (
        <>
          <Select value={when} onChange={(e) => setWhen(e.target.value)} className="w-full sm:w-auto">
            <option value="hoy">Hoy</option>
            <option value="manana">Mañana</option>
            <option value="semana">Esta semana</option>
            <option value="sin">Sin fecha</option>
            <option value="fecha">Elegir fecha</option>
          </Select>
          {when === "fecha" ? <Input type="date" value={custom} onChange={(e) => setCustom(e.target.value)} className="w-full sm:w-40" /> : null}
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full sm:w-auto">
            <option value="">Sin área</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full sm:w-auto">
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
          </Select>
        </>
      )}
      <Button type="submit" loading={pending} disabled={!title.trim()}>
        Añadir tarea
      </Button>
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}
