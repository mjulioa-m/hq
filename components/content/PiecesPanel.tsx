"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DropColumn } from "@/components/ui/Kanban";
import { STAGE_LABELS, stagesFor } from "@/lib/content-stages";
import { apiSend } from "@/lib/client-api";
import { cn } from "@/lib/cn";

export type PieceRow = {
  id: string;
  title: string;
  currentStage: string;
  status: string;
  platform: string;
};

export function PiecesPanel({
  pieces,
  platform,
  projectId,
}: {
  pieces: PieceRow[];
  platform: string;
  projectId: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"tabla" | "tablero">("tabla");
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function createPiece() {
    setError(null);
    try {
      const data = (await apiSend("/api/content/pieces", "POST", { title, platform, projectId })) as { item?: { id: string } };
      setTitle("");
      if (data.item?.id) router.push(`/contenido/pieza/${data.item.id}`);
      else router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear.");
    }
  }
  const stages = stagesFor(platform);
  const filtered = pieces.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  async function patch(id: string, body: Record<string, unknown>) {
    await apiSend(`/api/content/pieces/${id}`, "PATCH", body);
    router.refresh();
  }

  return (
    <div>
      <form
        className="mb-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void createPiece();
        }}
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nueva pieza…" className="sm:flex-1" />
        <Button type="submit">Crear y abrir</Button>
      </form>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="h-10 w-56 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
        />
        <div className="flex gap-2 text-sm">
          <button type="button" className={cn(mode === "tabla" && "text-accent")} onClick={() => setMode("tabla")}>
            Tabla
          </button>
          <button type="button" className={cn(mode === "tablero" && "text-accent")} onClick={() => setMode("tablero")}>
            Tablero
          </button>
        </div>
      </div>
      {mode === "tabla" ? (
        <div className="space-y-2">
          {filtered.length === 0 ? <p className="text-sm text-ink-3">No hay piezas en esta vista.</p> : null}
          {filtered.map((piece) => {
            const idx = Math.max(0, stages.indexOf(piece.currentStage));
            return (
              <div key={piece.id} className="glass flex flex-wrap items-center gap-3 px-4 py-3">
                <Link href={`/contenido/pieza/${piece.id}`} className="min-w-[180px] flex-1 text-sm font-medium">
                  {piece.title}
                </Link>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{STAGE_LABELS[piece.currentStage] ?? piece.currentStage}</span>
                <div className="flex gap-1" aria-label="Progreso">
                  {stages.map((stage, i) => (
                    <span key={stage} className={cn("h-1.5 w-5 rounded-full", i <= idx ? "bg-accent" : "bg-white/15")} />
                  ))}
                </div>
                <button type="button" className="text-sm text-accent" onClick={() => void apiSend(`/api/content/pieces/${piece.id}/stages/${piece.currentStage}`, "POST").then(() => router.refresh())}>
                  ✓
                </button>
                <button type="button" className="text-sm text-ink-3" onClick={() => void patch(piece.id, { status: "archivado" })}>
                  Archivar
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const cards = filtered.filter((p) => p.currentStage === stage);
            return (
              <DropColumn
                key={stage}
                id={stage}
                title={STAGE_LABELS[stage] ?? stage}
                count={cards.length}
                onDropId={(cardId, columnId) => void patch(cardId, { currentStage: columnId })}
              >
                {cards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/contenido/pieza/${card.id}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", card.id)}
                    className="block rounded-xl bg-black/25 p-3 text-sm"
                  >
                    {card.title}
                  </Link>
                ))}
              </DropColumn>
            );
          })}
        </div>
      )}
    </div>
  );
}
