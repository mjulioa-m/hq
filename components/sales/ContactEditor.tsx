"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ACTIVITY_TYPES, CONTACT_STAGES } from "@/lib/constants";
import { formatLong } from "@/lib/dates";
import { apiSend } from "@/lib/client-api";

export function ContactEditor({
  contact,
  activities,
}: {
  contact: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    source: string;
    stage: string;
    value: string | null;
    nextAction: string;
    nextActionDate: string | null;
    notes: string;
    projectId: string | null;
  };
  activities: { id: string; type: string; summary: string; happenedAt: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...contact,
    value: contact.value ?? "",
    nextActionDate: contact.nextActionDate ?? "",
  });
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("nota");
  const [when, setWhen] = useState("");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    try {
      await apiSend(`/api/contacts/${contact.id}`, "PATCH", {
        ...form,
        value: form.value || null,
        nextActionDate: form.nextActionDate || null,
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  async function addActivity() {
    await apiSend(`/api/contacts/${contact.id}/activities`, "POST", {
      type,
      summary,
      happenedAt: when || undefined,
    });
    setSummary("");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass space-y-3 p-4">
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Empresa" />
        <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Correo" />
        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Teléfono" />
        <Input value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="Origen" />
        <Select value={form.stage} onChange={(e) => set("stage", e.target.value)}>
          {CONTACT_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <Input value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="Valor COP" />
        <Input value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} placeholder="Siguiente acción" />
        <Input type="date" value={form.nextActionDate} onChange={(e) => set("nextActionDate", e.target.value)} />
        <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button onClick={() => void save()}>Guardar</Button>
      </section>
      <section className="glass p-4">
        <h2 className="mb-3 font-medium">Actividad</h2>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Select value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-auto">
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
          <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Qué pasó" className="w-full sm:min-w-[160px] sm:flex-1" />
          <Input type="date" value={when} onChange={(e) => setWhen(e.target.value)} className="w-full sm:w-40" />
          <Button tone="ghost" onClick={() => void addActivity()}>
            Anotar
          </Button>
        </div>
        <ol className="space-y-3">
          {activities.length === 0 ? <li className="text-sm text-ink-3">Sin actividad todavía.</li> : null}
          {activities.map((activity) => (
            <li key={activity.id} className="border-l border-accent/50 pl-3">
              <p className="text-xs text-ink-3">
                {ACTIVITY_TYPES.find((t) => t.id === activity.type)?.label} · {formatLong(activity.happenedAt.slice(0, 10))}
              </p>
              <p className="text-sm">{activity.summary}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
