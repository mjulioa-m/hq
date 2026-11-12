"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { apiSend } from "@/lib/client-api";

export function DailyEditor({ date, initial }: { date: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "guardando" | "guardado">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setState("guardando");
    timer.current = setTimeout(() => {
      void apiSend(`/api/daily/${date}`, "PUT", { content: value })
        .then(() => setState("guardado"))
        .catch(() => setState("idle"));
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, date]);

  return (
    <div>
      <div className="mb-2 text-xs text-ink-3">
        {state === "guardando" ? "Guardando…" : state === "guardado" ? "Guardado" : "El diario se guarda solo"}
      </div>
      <MarkdownEditor value={value} onChange={setValue} placeholder="Qué pasó hoy…" />
    </div>
  );
}
