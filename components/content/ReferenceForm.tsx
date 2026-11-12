"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { REFERENCE_TAGS } from "@/lib/content-stages";
import { apiSend } from "@/lib/client-api";

export function ReferenceForm({
  platform,
  projectId,
}: {
  platform: string;
  projectId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [views, setViews] = useState("");
  const [tag, setTag] = useState("competencia");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    try {
      await apiSend("/api/content/references", "POST", {
        platform,
        projectId,
        url,
        title: title || url,
        author,
        views,
        tag,
        notes,
      });
      setOpen(false);
      setUrl("");
      setTitle("");
      setAuthor("");
      setViews("");
      setNotes("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Añadir referencia</Button>
      <Modal open={open} title="Nueva referencia" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (YouTube rellena título y autor)" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autor" />
          <Input value={views} onChange={(e) => setViews(e.target.value)} placeholder="Vistas" inputMode="numeric" />
          <Select value={tag} onChange={(e) => setTag(e.target.value)}>
            {REFERENCE_TAGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button onClick={() => void save()}>Guardar</Button>
        </div>
      </Modal>
    </>
  );
}
