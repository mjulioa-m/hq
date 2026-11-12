"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { apiSend } from "@/lib/client-api";
import {
  REMINDER_PRESETS,
  REMINDER_UNITS,
  dueLabel,
  formatWhen,
  reminderPhrase,
  type ReminderUnit,
} from "@/lib/reminder-schedule";

export type ReminderCard = {
  id: string;
  name: string;
  everyAmount: number;
  everyUnit: ReminderUnit;
  nextAt: string;
};

const UNIT_LABEL: Record<ReminderUnit, string> = {
  hour: "Horas",
  day: "Días",
  week: "Semanas",
  month: "Meses",
};

export function ReminderBoard({ items }: { items: ReminderCard[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState<ReminderUnit>("day");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const now = new Date();

  async function create() {
    setPending(true);
    setError(null);
    try {
      await apiSend("/api/reminders", "POST", { name, everyAmount: amount, everyUnit: unit });
      setName("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear.");
    } finally {
      setPending(false);
    }
  }

  async function done(id: string) {
    await apiSend(`/api/reminders/${id}`, "PATCH", { done: true });
    router.refresh();
  }

  async function remove(id: string) {
    await apiSend(`/api/reminders/${id}`, "DELETE");
    router.refresh();
  }

  return (
    <div>
      <form
        className="glass p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <div className="flex flex-wrap gap-2">
          {REMINDER_PRESETS.map((preset) => {
            const active = amount === preset.amount && unit === preset.unit;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setAmount(preset.amount);
                  setUnit(preset.unit);
                }}
                className={
                  active
                    ? "rounded-full bg-accent px-3 py-1 text-sm text-accent-ink"
                    : "rounded-full bg-white/10 px-3 py-1 text-sm text-ink-2"
                }
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del recordatorio"
            className="sm:flex-1"
            required
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-2">cada</span>
            <div className="w-20">
              <Input
                type="number"
                min={1}
                max={365}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <Select value={unit} onChange={(e) => setUnit(e.target.value as ReminderUnit)} className="w-32">
              {REMINDER_UNITS.map((id) => (
                <option key={id} value={id}>
                  {UNIT_LABEL[id]}
                </option>
              ))}
            </Select>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </form>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-ink-3">Todavía no hay recordatorios.</p> : null}
        {items.map((item) => {
          const next = new Date(item.nextAt);
          const due = next.getTime() <= now.getTime() + 60_000;
          return (
            <article key={item.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <h2 className="display text-2xl">{item.name}</h2>
                <p className="mt-1 text-sm text-ink-2">
                  {reminderPhrase(item.everyAmount, item.everyUnit)}
                  <span className="text-ink-3"> · {formatWhen(next)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={due ? "text-sm font-medium text-accent" : "text-sm text-ink-2"}>
                  {dueLabel(next, now)}
                </span>
                <Button onClick={() => void done(item.id)}>Listo</Button>
                <Button tone="ghost" onClick={() => void remove(item.id)}>
                  Quitar
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
