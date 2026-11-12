"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropColumn } from "@/components/ui/Kanban";
import { DataTable } from "@/components/ui/DataTable";
import { CONTACT_STAGES } from "@/lib/constants";
import { formatCOP } from "@/lib/money";
import { formatShort } from "@/lib/dates";
import { apiSend } from "@/lib/client-api";
import { cn } from "@/lib/cn";

export type ContactCard = {
  id: string;
  name: string;
  company: string;
  stage: string;
  value: string | null;
  nextAction: string;
  nextActionDate: string | null;
};

export function PipelineBoard({ contacts }: { contacts: ContactCard[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"tablero" | "tabla">("tablero");

  async function move(id: string, stage: string) {
    await apiSend(`/api/contacts/${id}`, "PATCH", { stage });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex gap-3 text-sm">
        <button type="button" className={cn(mode === "tablero" && "text-accent")} onClick={() => setMode("tablero")}>
          Tablero
        </button>
        <button type="button" className={cn(mode === "tabla" && "text-accent")} onClick={() => setMode("tabla")}>
          Tabla
        </button>
      </div>
      {mode === "tablero" ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CONTACT_STAGES.map((stage) => {
            const cards = contacts.filter((c) => c.stage === stage.id);
            return (
              <DropColumn key={stage.id} id={stage.id} title={stage.label} count={cards.length} onDropId={(id, col) => void move(id, col)}>
                {cards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/ventas/contacto/${card.id}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", card.id)}
                    className="block rounded-xl bg-black/25 p-3 text-sm"
                  >
                    <p className="font-medium">{card.name}</p>
                    <p className="text-xs text-ink-3">{card.company}</p>
                    {card.value ? <p className="mt-1 text-xs">{formatCOP(card.value)}</p> : null}
                  </Link>
                ))}
              </DropColumn>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={["Nombre", "Empresa", "Etapa", "Siguiente", "Fecha", "Valor"]}
          rows={contacts.map((c) => [
            <Link key={c.id} href={`/ventas/contacto/${c.id}`} className="text-accent">
              {c.name}
            </Link>,
            c.company,
            CONTACT_STAGES.find((s) => s.id === c.stage)?.label ?? c.stage,
            c.nextAction || "—",
            c.nextActionDate ? formatShort(c.nextActionDate) : "—",
            c.value ? formatCOP(c.value) : "—",
          ])}
          empty="Todavía no hay contactos."
        />
      )}
    </div>
  );
}
