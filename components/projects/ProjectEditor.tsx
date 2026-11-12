"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { apiSend } from "@/lib/client-api";

export function ProjectEditor({
  project,
}: {
  project: { id: string; name: string; description: string; color: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [color, setColor] = useState(project.color);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    try {
      await apiSend(`/api/projects/${project.id}`, "PATCH", { name, description, color });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <div className="glass space-y-3 p-4">
      <h2 className="font-medium">El proyecto</h2>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
      <label className="flex items-center gap-3 text-sm">
        Color
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 bg-transparent" />
        <Input value={color} onChange={(e) => setColor(e.target.value)} className="w-32" />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button onClick={() => void save()}>Guardar</Button>
    </div>
  );
}
