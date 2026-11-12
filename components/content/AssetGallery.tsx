"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { apiSend } from "@/lib/client-api";

export type AssetItem = {
  id: string;
  kind: string;
  label: string;
  url: string | null;
  filePath: string | null;
  isChosen: boolean;
  stage: string;
};

export function AssetGallery({ pieceId, stage, assets }: { pieceId: string; stage: string; assets: AssetItem[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mine = assets.filter((a) => a.stage === stage);

  async function addLink() {
    try {
      await apiSend(`/api/content/pieces/${pieceId}/assets`, "POST", { stage, kind: "enlace", label: label || url, url });
      setLabel("");
      setUrl("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo añadir.");
    }
  }

  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    const data = (await res.json()) as { error?: string; url?: string; path?: string; kind?: string };
    if (!res.ok || !data.url) {
      setError(data.error || "No se pudo subir.");
      return;
    }
    await apiSend(`/api/content/pieces/${pieceId}/assets`, "POST", {
      stage,
      kind: data.kind === "video" ? "video" : "imagen",
      label: file.name,
      url: data.url,
      filePath: data.path,
    });
    router.refresh();
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <label className="glass inline-flex h-10 cursor-pointer items-center px-3 text-sm">
          Subir foto o video
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enlace" className="max-w-xs" />
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Etiqueta" className="max-w-[160px]" />
        <Button tone="ghost" onClick={() => void addLink()}>
          Añadir enlace
        </Button>
      </div>
      {error ? <p className="mb-2 text-sm text-danger">{error}</p> : null}
      {mine.length === 0 ? <p className="text-sm text-ink-3">Todavía no hay fotos ni videos en esta fase.</p> : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {mine.map((asset) => {
          const src = asset.filePath ? `/api/files/${asset.filePath}` : asset.url;
          return (
            <figure key={asset.id} className="overflow-hidden rounded-xl bg-black/30">
              {asset.kind === "imagen" && src ? (
                <button type="button" className="block w-full" onClick={() => setPreview(src)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={asset.label} className="h-28 w-full object-cover" />
                </button>
              ) : asset.kind === "video" && src ? (
                <video src={src} controls className="h-28 w-full bg-black" />
              ) : (
                <a href={asset.url ?? "#"} className="block p-3 text-sm text-accent" target="_blank" rel="noreferrer">
                  {asset.label || asset.url}
                </a>
              )}
              <figcaption className="flex items-center justify-between gap-2 px-2 py-2 text-xs">
                <span className="truncate">{asset.label}</span>
                <button
                  type="button"
                  className={asset.isChosen ? "text-accent" : "text-ink-3"}
                  onClick={() => void apiSend(`/api/content/assets/${asset.id}`, "PATCH", { isChosen: true }).then(() => router.refresh())}
                >
                  {asset.isChosen ? "Elegida" : "Elegir"}
                </button>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <Modal open={!!preview} title="Imagen" onClose={() => setPreview(null)}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="max-h-[70vh] w-full object-contain" />
        ) : null}
      </Modal>
    </div>
  );
}
