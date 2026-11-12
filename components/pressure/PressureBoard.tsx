"use client";

import { HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { apiSend } from "@/lib/client-api";
import { pressureFieldError, pressurePairError } from "@/lib/pressure-rules";

type PressureSlot = "manana" | "tarde" | "noche";

const SLOT_LABEL: Record<PressureSlot, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

export type PressureCard = {
  id: string;
  day: string;
  slot: PressureSlot;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  note: string;
};

const SLOTS: PressureSlot[] = ["manana", "tarde", "noche"];

export function PressureBoard({
  today,
  todayItems,
  history,
  reminderName,
}: {
  today: string;
  todayItems: PressureCard[];
  history: { day: string; label: string; items: PressureCard[] }[];
  reminderName: string | null;
}) {
  const taken = todayItems.length;

  return (
    <div className="space-y-4">
      <section className="glass p-4">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="display text-xl">Hoy</h2>
          <span className="text-sm text-ink-3">{taken} de 3</span>
        </header>
        <p className="mb-4 text-sm text-ink-3">
          Anota la sistólica y la diastólica en cada toma.
          {reminderName ? ` El aviso «${reminderName}» sigue en Recordatorios.` : " El aviso que creaste sigue en Recordatorios."}
        </p>
        <div className="grid gap-3 lg:grid-cols-3">
          {SLOTS.map((slot) => (
            <SlotCard
              key={`${slot}-${todayItems.find((item) => item.slot === slot)?.id ?? "vacio"}`}
              day={today}
              slot={slot}
              reading={todayItems.find((item) => item.slot === slot) ?? null}
            />
          ))}
        </div>
      </section>
      <section className="glass p-4">
        <h2 className="display mb-3 text-xl">Días anteriores</h2>
        {history.length === 0 ? (
          <EmptyState
            icon={HeartPulse}
            title="Sin días anteriores"
            description="Cuando anotes otros días, el control queda aquí."
          />
        ) : (
        <ul className="space-y-3">
          {history.map((day) => (
            <li key={day.day} className="border-t border-white/8 pt-3">
              <p className="mb-2 text-sm text-ink-2">{day.label}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {SLOTS.map((slot) => {
                  const reading = day.items.find((item) => item.slot === slot);
                  return (
                    <p key={slot} className="text-sm">
                      <span className="text-ink-3">{SLOT_LABEL[slot]} </span>
                      <span className="font-medium">{reading ? `${reading.systolic}/${reading.diastolic}` : "—"}</span>
                      {reading?.pulse ? <span className="text-ink-3"> · {reading.pulse}</span> : null}
                    </p>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
        )}
      </section>
    </div>
  );
}

function pairMessage(systolic: string, diastolic: string) {
  if (pressureFieldError("systolic", systolic) || pressureFieldError("diastolic", diastolic)) return undefined;
  return pressurePairError(Number(systolic), Number(diastolic)) ?? undefined;
}

function SlotCard({ day, slot, reading }: { day: string; slot: PressureSlot; reading: PressureCard | null }) {
  const router = useRouter();
  const { notify } = useToast();
  const label = SLOT_LABEL[slot].toLowerCase();
  const [systolic, setSystolic] = useState(reading ? String(reading.systolic) : "");
  const [diastolic, setDiastolic] = useState(reading ? String(reading.diastolic) : "");
  const [pulse, setPulse] = useState(reading?.pulse ? String(reading.pulse) : "");
  const [errors, setErrors] = useState<{ systolic?: string; diastolic?: string; pulse?: string; pair?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const blocked = Boolean(errors.systolic || errors.diastolic || errors.pulse || errors.pair || !systolic.trim() || !diastolic.trim());

  function blurField(kind: "systolic" | "diastolic" | "pulse", value: string) {
    setErrors((current) => {
      const sys = kind === "systolic" ? value : systolic;
      const dia = kind === "diastolic" ? value : diastolic;
      return {
        ...current,
        [kind]: pressureFieldError(kind, value) ?? undefined,
        pair: pairMessage(sys, dia),
      };
    });
  }

  async function save() {
    const next = {
      systolic: pressureFieldError("systolic", systolic) ?? undefined,
      diastolic: pressureFieldError("diastolic", diastolic) ?? undefined,
      pulse: pressureFieldError("pulse", pulse) ?? undefined,
      pair: pairMessage(systolic, diastolic),
    };
    setErrors(next);
    if (next.systolic || next.diastolic || next.pulse || next.pair) return;
    setPending(true);
    setError(null);
    try {
      await apiSend("/api/pressure", "POST", {
        day,
        slot,
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse.trim() ? Number(pulse) : null,
      });
      notify({ tone: "ok", message: `Presión de la ${label} guardada` });
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo guardar.";
      setError(message);
      notify({ tone: "error", message });
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!reading) return;
    setPending(true);
    setError(null);
    try {
      await apiSend(`/api/pressure/${reading.id}`, "DELETE");
      setSystolic("");
      setDiastolic("");
      setPulse("");
      setConfirming(false);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo borrar.";
      setError(message);
      notify({ tone: "error", message });
      setPending(false);
    }
  }

  return (
    <>
      <form
        className="rounded-2xl bg-white/5 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-medium">{SLOT_LABEL[slot]}</h3>
          {reading ? <span className="text-lg font-semibold">{reading.systolic}/{reading.diastolic}</span> : null}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PressureField
            id={`${slot}-systolic`}
            label="Sistólica"
            value={systolic}
            error={errors.systolic}
            onChange={setSystolic}
            onBlur={() => blurField("systolic", systolic)}
          />
          <PressureField
            id={`${slot}-diastolic`}
            label="Diastólica"
            value={diastolic}
            error={errors.diastolic ?? errors.pair}
            onChange={setDiastolic}
            onBlur={() => blurField("diastolic", diastolic)}
          />
          <PressureField
            id={`${slot}-pulse`}
            label="Pulso"
            value={pulse}
            error={errors.pulse}
            placeholder="Opc."
            onChange={setPulse}
            onBlur={() => blurField("pulse", pulse)}
          />
        </div>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        <div className="mt-3 flex gap-2">
          <Button type="submit" loading={pending} disabled={blocked}>
            {`Guardar ${label}`}
          </Button>
          {reading ? (
            <Button type="button" tone="ghost" onClick={() => setConfirming(true)}>
              Quitar
            </Button>
          ) : null}
        </div>
      </form>
      <ConfirmDialog
        open={confirming}
        title={`¿Quitar la toma de la ${label}?`}
        message={`Se borra ${reading?.systolic}/${reading?.diastolic} de hoy. Puedes volver a anotarla.`}
        confirmLabel="Quitar toma"
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => void remove()}
      />
    </>
  );
}

function PressureField({
  id,
  label,
  value,
  error,
  placeholder,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <label className="text-[11px] text-ink-3">
      {label}
      <Input
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="mt-1"
      />
      {error ? (
        <p id={errorId} className="mt-1 text-[11px] text-danger">
          {error}
        </p>
      ) : null}
    </label>
  );
}
