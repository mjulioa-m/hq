"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AssetGallery, type AssetItem } from "@/components/content/AssetGallery";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { STAGE_LABELS } from "@/lib/content-stages";
import { apiSend } from "@/lib/client-api";
import { cn } from "@/lib/cn";

export function PieceStepper({
  pieceId,
  stages,
  current,
  notes,
  assets,
}: {
  pieceId: string;
  stages: string[];
  current: string;
  notes: { stage: string; content: string; done: boolean }[];
  assets: AssetItem[];
}) {
  const router = useRouter();
  const [stage, setStage] = useState(current);
  const note = notes.find((n) => n.stage === stage);
  const done = note?.done;
  const countFor = (id: string) => assets.filter((a) => a.stage === id).length + (notes.find((n) => n.stage === id && n.content)?.content ? 1 : 0);

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {stages.map((id, index) => {
          const isDone = notes.find((n) => n.stage === id)?.done;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setStage(id)}
              className={cn(
                "min-w-[120px] rounded-xl border px-3 py-2 text-left text-xs",
                stage === id ? "border-accent bg-white/10" : "border-white/10 bg-black/20"
              )}
            >
              <span className={cn("mr-1", isDone ? "text-accent" : "text-ink-3")}>{isDone ? "✓" : index + 1}</span>
              {STAGE_LABELS[id] ?? id}
              <span className="mt-1 block text-ink-3">{countFor(id) || ""}</span>
            </button>
          );
        })}
      </div>
      <section className="glass p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="display text-2xl">{STAGE_LABELS[stage] ?? stage}</h2>
          <div className="flex items-center gap-2">
            <Badge tone={done ? "ok" : "neutral"}>{done ? "Hecho" : "Pendiente"}</Badge>
            <Button
              onClick={() =>
                void apiSend(`/api/content/pieces/${pieceId}/stages/${stage}`, "POST").then(() => router.refresh())
              }
            >
              Marcar como hecho
            </Button>
          </div>
        </div>
        <StageNote key={stage} pieceId={pieceId} stage={stage} initial={note?.content ?? ""} />
        <AssetGallery pieceId={pieceId} stage={stage} assets={assets} />
      </section>
    </div>
  );
}

function StageNote({ pieceId, stage, initial }: { pieceId: string; stage: string; initial: string }) {
  const [content, setContent] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skip = useRef(true);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void apiSend(`/api/content/pieces/${pieceId}/stages/${stage}`, "PUT", { content });
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [content, pieceId, stage]);

  return <MarkdownEditor value={content} onChange={setContent} />;
}
