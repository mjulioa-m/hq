"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiSend } from "@/lib/client-api";
import Link from "next/link";

export function IdeasPanel({
  platform,
  projectId,
  ideas,
}: {
  platform: string;
  projectId: string | null;
  ideas: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function add() {
    try {
      await apiSend("/api/content/pieces", "POST", { title, platform, projectId, format: platform === "youtube" ? "video" : undefined });
      setTitle("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear.");
    }
  }

  return (
    <div>
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nueva idea…" />
        <Button type="submit">Añadir</Button>
      </form>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <ul className="space-y-2">
        {ideas.length === 0 ? <li className="text-sm text-ink-3">No hay ideas en marcha.</li> : null}
        {ideas.map((idea) => (
          <li key={idea.id}>
            <Link href={`/contenido/pieza/${idea.id}`} className="glass block px-4 py-3 text-sm hover:bg-white/5">
              {idea.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
