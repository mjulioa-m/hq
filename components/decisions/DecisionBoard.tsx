"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { formatShort } from "@/lib/dates";
import { apiSend } from "@/lib/client-api";

export type DecisionCard = {
  id: string;
  title: string;
  context: string;
  options: string[];
  status: string;
  outcome: string;
  dueDate: string | null;
  projectName?: string | null;
};

export function DecisionBoard({
  items,
  projects,
  defaultProjectId,
}: {
  items: DecisionCard[];
  projects: { id: string; name: string }[];
  defaultProjectId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deciding, setDeciding] = useState<DecisionCard | null>(null);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [projectFrom, setProjectFrom] = useState(defaultProjectId);
  if (projectFrom !== defaultProjectId) {
    setProjectFrom(defaultProjectId);
    setProjectId(defaultProjectId ?? "");
  }
  const [outcome, setOutcome] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function create() {
    try {
      await apiSend("/api/decisions", "POST", {
        title,
        context,
        options: options.split("\n"),
        dueDate: dueDate || null,
        projectId: projectId || null,
      });
      setOpen(false);
      setTitle("");
      setContext("");
      setOptions("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear.");
    }
  }

  async function decide(status: "decidida" | "descartada") {
    if (!deciding) return;
    await apiSend(`/api/decisions/${deciding.id}`, "PATCH", { status, outcome });
    setDeciding(null);
    setOutcome("");
    router.refresh();
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Nueva decisión</Button>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-ink-3">Nada en esta lista.</p> : null}
        {items.map((item) => (
          <article key={item.id} className="glass p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-medium">{item.title}</h3>
              <div className="flex gap-2">
                {item.projectName ? <Badge>{item.projectName}</Badge> : null}
                {item.dueDate ? <Badge tone="hot">{formatShort(item.dueDate)}</Badge> : null}
              </div>
            </div>
            {item.context ? <p className="mt-2 text-sm whitespace-pre-wrap text-ink-2">{item.context}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {item.options.map((option) => (
                <span key={option} className="rounded-full bg-white/10 px-2 py-1 text-xs">
                  {option}
                </span>
              ))}
            </div>
            {item.outcome ? <p className="mt-3 text-sm text-ok">Resultado: {item.outcome}</p> : null}
            {item.status === "pendiente" ? (
              <div className="mt-3 flex gap-2">
                <Button
                  className="h-8"
                  onClick={() => {
                    setDeciding(item);
                    setOutcome(item.options[0] ?? "");
                  }}
                >
                  Decidir
                </Button>
                <Button tone="ghost" className="h-8" onClick={() => void apiSend(`/api/decisions/${item.id}`, "PATCH", { status: "descartada", outcome: "" }).then(() => router.refresh())}>
                  Descartar
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <Modal open={open} title="Nueva decisión" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Qué hay que decidir" />
          <TextArea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Contexto" />
          <TextArea value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Una opción por línea" />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button onClick={() => void create()}>Crear</Button>
        </div>
      </Modal>
      <Modal open={!!deciding} title="Decidir" onClose={() => setDeciding(null)}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {deciding?.options.map((option) => (
              <button key={option} type="button" className="rounded-full bg-white/10 px-3 py-1 text-sm" onClick={() => setOutcome(option)}>
                {option}
              </button>
            ))}
          </div>
          <TextArea value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Resultado" />
          <Button onClick={() => void decide("decidida")}>Guardar decisión</Button>
        </div>
      </Modal>
    </div>
  );
}
