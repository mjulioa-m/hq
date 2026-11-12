import { SkillBoard } from "@/components/skills/SkillBoard";
import { SceneHero } from "@/components/scene/SceneHero";
import { Input } from "@/components/ui/Input";
import { listSkills } from "@/lib/skills";

export const dynamic = "force-dynamic";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const items = await listSkills(sp.q);
  return (
    <div>
      <SceneHero scene="aprendido" title="Skills" subtitle="Prompts globales. No dependen de un proyecto." />
      <form className="mt-4 mb-4 flex flex-wrap gap-2" action="/skills">
        <Input name="q" defaultValue={sp.q ?? ""} placeholder="Buscar por nombre o prompt" className="max-w-sm" />
        <button type="submit" className="h-10 rounded-[10px] bg-accent px-4 text-sm text-accent-ink">
          Buscar
        </button>
      </form>
      <SkillBoard query={sp.q?.trim() ?? ""} items={items.map((item) => ({ id: item.id, name: item.name, prompt: item.prompt }))} />
    </div>
  );
}
