"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { apiSend } from "@/lib/client-api";

export type LearningCard = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
  projectId: string | null;
};

export function LearningGrid({
  items,
  projects,
  defaultProjectId,
}: {
  items: LearningCard[];
  projects: { id: string; name: string }[];
  defaultProjectId?: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<LearningCard | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div>
      <Button
        onClick={() => {
          setCreating(true);
          setEditing({
            id: "",
            title: "",
            content: "",
            tags: [],
            source: "",
            projectId: defaultProjectId ?? null,
          });
        }}
      >
        Nueva nota
      </Button>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.length === 0 ? <p className="text-sm text-ink-3">Todavía no hay aprendizajes.</p> : null}
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => { setCreating(false); setEditing(item); }} className="glass p-4 text-left">
            <h3 className="font-medium">{item.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-ink-2">{item.content}</p>
            <p className="mt-3 text-xs text-ink-3">{item.tags.join(" · ")}</p>
          </button>
        ))}
      </div>
      {editing ? (
        <LearningModal
          creating={creating}
          item={editing}
          projects={projects}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function LearningModal({
  item,
  creating,
  projects,
  onClose,
  onSaved,
}: {
  item: LearningCard;
  creating: boolean;
  projects: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [tags, setTags] = useState(item.tags.join(", "));
  const [source, setSource] = useState(item.source);
  const [projectId, setProjectId] = useState(item.projectId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const body = { title, content, tags, source, projectId: projectId || null };
    try {
      if (creating) await apiSend("/api/learnings", "POST", body);
      else await apiSend(`/api/learnings/${item.id}`, "PATCH", body);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <Modal open title={creating ? "Nueva nota" : "Editar nota"} onClose={onClose}>
      <div className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
        <MarkdownEditor value={content} onChange={setContent} />
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Etiquetas, separadas por coma" />
        <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Fuente" />
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Sin proyecto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-between">
          {!creating ? (
            <Button
              tone="danger"
              onClick={() => void apiSend(`/api/learnings/${item.id}`, "DELETE").then(onSaved)}
            >
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={() => void save()}>Guardar</Button>
        </div>
      </div>
    </Modal>
  );
}

