"use client";

import { ScrollText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { apiSend } from "@/lib/client-api";

export type SkillCard = {
  id: string;
  name: string;
  prompt: string;
};

export function SkillBoard({ items, query }: { items: SkillCard[]; query: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const [editing, setEditing] = useState<SkillCard | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function openCreate() {
    setCreating(true);
    setEditing({ id: "", name: "", prompt: "" });
  }

  async function copy(item: SkillCard) {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(item.id);
      window.setTimeout(() => setCopied((current) => (current === item.id ? null : current)), 1500);
    } catch {
      notify({ tone: "error", message: "No se pudo copiar. Abre la skill y copia el texto a mano." });
    }
  }

  return (
    <div>
      {items.length === 0 && !query ? null : (
        <Button onClick={openCreate}>Nueva skill</Button>
      )}
      {items.length === 0 ? (
        query ? (
          <EmptyState
            icon={ScrollText}
            title={`No hay skills con «${query}»`}
            action={
              <Link href="/skills" className="inline-flex h-10 items-center justify-center rounded-[10px] bg-accent px-4 text-sm font-medium text-accent-ink">
                Limpiar búsqueda
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={ScrollText}
            title="Todavía no hay skills"
            description="Guarda aquí los prompts que usas seguido."
            action={<Button onClick={openCreate}>Crear la primera skill</Button>}
          />
        )
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="glass p-4">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  setCreating(false);
                  setEditing(item);
                }}
              >
                <h3 className="line-clamp-2 break-words font-medium">{item.name}</h3>
                <p className="mt-2 line-clamp-4 text-sm whitespace-pre-line text-ink-2">{item.prompt}</p>
              </button>
              <button type="button" className="mt-3 text-sm text-accent" onClick={() => void copy(item)}>
                {copied === item.id ? "Copiado" : "Copiar prompt"}
              </button>
            </article>
          ))}
        </div>
      )}
      {editing ? (
        <SkillModal
          creating={creating}
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            notify({ tone: "ok", message });
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function SkillModal({
  item,
  creating,
  onClose,
  onSaved,
}: {
  item: SkillCard;
  creating: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const { notify } = useToast();
  const [name, setName] = useState(item.name);
  const [prompt, setPrompt] = useState(item.prompt);
  const [nameError, setNameError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function validateName(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Escribe el nombre.";
    if (trimmed.length > 120) return "Máximo 120 caracteres.";
    return null;
  }

  function validatePrompt(value: string) {
    if (!value.trim()) return "Escribe el prompt.";
    return null;
  }

  async function save() {
    const nextName = validateName(name);
    const nextPrompt = validatePrompt(prompt);
    setNameError(nextName);
    setPromptError(nextPrompt);
    if (nextName || nextPrompt) return;
    setPending(true);
    setError(null);
    try {
      if (creating) await apiSend("/api/skills", "POST", { name, prompt });
      else await apiSend(`/api/skills/${item.id}`, "PATCH", { name, prompt });
      onSaved(creating ? "Skill creada" : "Skill guardada");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    setError(null);
    try {
      await apiSend(`/api/skills/${item.id}`, "DELETE");
      onSaved("Skill eliminada");
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo borrar.";
      setError(message);
      notify({ tone: "error", message });
      setPending(false);
    }
  }

  return (
    <>
      <Modal open={!confirming} title={creating ? "Nueva skill" : "Editar skill"} onClose={onClose}>
        <div className="space-y-3">
          <div>
            <Input
              data-autofocus
              value={name}
              placeholder="Nombre"
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? "skill-name-error" : undefined}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setNameError(validateName(name))}
            />
            {nameError ? (
              <p id="skill-name-error" className="mt-1 text-sm text-danger">
                {nameError}
              </p>
            ) : null}
          </div>
          <div>
            <TextArea
              value={prompt}
              placeholder="El prompt"
              className="min-h-56"
              aria-invalid={promptError ? true : undefined}
              aria-describedby={promptError ? "skill-prompt-error" : undefined}
              onChange={(event) => setPrompt(event.target.value)}
              onBlur={() => setPromptError(validatePrompt(prompt))}
            />
            {promptError ? (
              <p id="skill-prompt-error" className="mt-1 text-sm text-danger">
                {promptError}
              </p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-between gap-2">
            {creating ? <span /> : (
              <Button tone="danger" onClick={() => setConfirming(true)}>
                Eliminar
              </Button>
            )}
            <Button loading={pending} onClick={() => void save()}>
              {creating ? "Crear skill" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="¿Eliminar esta skill?"
        message={`Se borra «${item.name}» y su prompt. No se puede deshacer.`}
        confirmLabel="Eliminar skill"
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => void remove()}
      />
    </>
  );
}
