"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/money";
import { formatShort } from "@/lib/dates";
import { apiSend } from "@/lib/client-api";

export type ReferenceCard = {
  id: string;
  title: string;
  author: string;
  views: number | null;
  url: string;
  publishedOn: string | null;
  createdAt: string;
  useful: boolean | null;
};

export function InvestigationPanel({ items }: { items: ReferenceCard[] }) {
  const router = useRouter();

  async function mark(id: string, useful: boolean) {
    await apiSend(`/api/content/references/${id}`, "PATCH", { useful });
    router.refresh();
  }

  async function convert(id: string) {
    await apiSend(`/api/content/references/${id}/convert`, "POST");
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-3">Todavía no hay referencias en este filtro.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="glass p-4">
          <h3 className="font-medium">{item.title}</h3>
          <p className="mt-1 text-sm text-ink-2">{item.author || "Sin autor"}</p>
          <p className="mt-2 text-xs text-ink-3">
            {item.views !== null ? `${formatNumber(item.views)} vistas` : "Sin vistas"} ·{" "}
            {item.publishedOn ? formatShort(item.publishedOn) : formatShort(item.createdAt.slice(0, 10))}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item.useful === true ? <Badge tone="ok">Útil</Badge> : null}
            {item.useful === false ? <Badge tone="danger">Descartada</Badge> : null}
            <Button tone="ghost" className="h-8 px-3" onClick={() => void mark(item.id, true)}>
              Útil
            </Button>
            <Button tone="ghost" className="h-8 px-3" onClick={() => void mark(item.id, false)}>
              Descartar
            </Button>
            <Button className="h-8 px-3" onClick={() => void convert(item.id)}>
              Convertir en idea
            </Button>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-accent">
                Abrir
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
