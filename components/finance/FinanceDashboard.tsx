"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FINANCE_CATEGORIES } from "@/lib/constants";
import { monthLabel, todayISO } from "@/lib/dates";
import { formatCOP } from "@/lib/money";
import { apiSend } from "@/lib/client-api";

export function MonthChart({
  rows,
}: {
  rows: { ym: string; income: number; expense: number }[];
}) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.income, r.expense]));
  const w = rows.length * 56;
  return (
    <svg viewBox={`0 0 ${w} 150`} className="h-40 w-full">
      {rows.map((row, i) => {
        const ih = (row.income / max) * 100;
        const eh = (row.expense / max) * 100;
        return (
          <g key={row.ym}>
            <rect x={i * 56 + 10} y={112 - ih} width={14} height={ih} rx={3} fill="#86efac" />
            <rect x={i * 56 + 28} y={112 - eh} width={14} height={eh} rx={3} fill="#f0c7a6" />
            <text x={i * 56 + 26} y={132} textAnchor="middle" fill="rgba(246,239,232,0.55)" fontSize="10">
              {monthLabel(row.ym)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function EntryForm({
  projects,
  defaultProjectId,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId?: string | null;
}) {
  const router = useRouter();
  const [type, setType] = useState("ingreso");
  const [amount, setAmount] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [projectFrom, setProjectFrom] = useState(defaultProjectId);
  if (projectFrom !== defaultProjectId) {
    setProjectFrom(defaultProjectId);
    setProjectId(defaultProjectId ?? "");
  }
  const [category, setCategory] = useState("Ventas");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);

  async function save() {
    try {
      await apiSend("/api/finance", "POST", {
        type,
        amount,
        projectId: projectId || null,
        category,
        description,
        entryDate,
      });
      setAmount("");
      setDescription("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <form
      className="glass mb-4 flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <Select value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-auto">
        <option value="ingreso">Ingreso</option>
        <option value="gasto">Gasto</option>
      </Select>
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto" className="w-full sm:w-32" />
      <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full sm:w-auto">
        <option value="">Sin proyecto</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full sm:w-auto">
        {FINANCE_CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" className="w-full sm:min-w-[160px] sm:flex-1" />
      <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full sm:w-40" />
      <Button type="submit">Añadir movimiento</Button>
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}

export function DeleteEntry({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-xs text-ink-3"
      onClick={() => void apiSend(`/api/finance/${id}`, "DELETE").then(() => router.refresh())}
    >
      Quitar
    </button>
  );
}

export function Money({ value, tone }: { value: number; tone?: "ok" | "bad" }) {
  return (
    <span className={tone === "ok" ? "text-ok" : tone === "bad" ? "text-danger" : undefined}>{formatCOP(value)}</span>
  );
}
