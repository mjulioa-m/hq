import { LearningGrid } from "@/components/learnings/LearningGrid";
import { SceneHero } from "@/components/scene/SceneHero";
import { Input } from "@/components/ui/Input";
import { listLearnings } from "@/lib/learnings";
import { listProjects, resolveProjectId } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function AprendidoPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; q?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const projectId = await resolveProjectId(sp.p);
  const projects = await listProjects();
  const items = await listLearnings({ projectId, q: sp.q, tag: sp.tag });
  const tags = [...new Set(items.flatMap((item) => item.tags ?? []))].sort();
  return (
    <div>
      <SceneHero scene="aprendido" title="Aprendido" subtitle="Notas que no quieres volver a buscar." />
      <form className="mt-4 mb-4 flex flex-wrap gap-2" action="/aprendido">
        {sp.p ? <input type="hidden" name="p" value={sp.p} /> : null}
        <Input name="q" defaultValue={sp.q ?? ""} placeholder="Buscar en título o nota" className="max-w-sm" />
        <Input name="tag" defaultValue={sp.tag ?? ""} placeholder="Etiqueta" className="w-40" />
        <button type="submit" className="h-10 rounded-[10px] bg-accent px-4 text-sm text-accent-ink">
          Buscar
        </button>
      </form>
      {tags.length > 0 ? <p className="mb-3 text-xs text-ink-3">Etiquetas en esta vista: {tags.join(" · ")}</p> : null}
      <LearningGrid
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          tags: item.tags ?? [],
          source: item.source,
          projectId: item.projectId,
        }))}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        defaultProjectId={projectId}
      />
    </div>
  );
}
