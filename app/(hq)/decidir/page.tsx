import { DecisionBoard } from "@/components/decisions/DecisionBoard";
import { SceneHero } from "@/components/scene/SceneHero";
import { Tabs } from "@/components/ui/Tabs";
import { listDecisions } from "@/lib/decisions";
import { DECISION_STATUSES } from "@/lib/constants";
import { listProjects, resolveProjectId } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function DecidirPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; estado?: string }>;
}) {
  const sp = await searchParams;
  const estado = sp.estado ?? "pendiente";
  const projectId = await resolveProjectId(sp.p);
  const projects = await listProjects();
  const byId = new Map(projects.map((p) => [p.id, p]));
  const items = await listDecisions({ projectId, status: estado });
  const href = (id: string) => {
    const q = new URLSearchParams();
    if (sp.p) q.set("p", sp.p);
    q.set("estado", id);
    return `/decidir?${q.toString()}`;
  };
  return (
    <div>
      <SceneHero scene="decidir" title="Decidir" subtitle="Lo que sigue abierto hasta que elijas." />
      <div className="mt-4 mb-4">
        <Tabs
          items={DECISION_STATUSES.map((status) => ({
            href: href(status.id),
            label: status.label,
            active: estado === status.id,
          }))}
        />
      </div>
      <DecisionBoard
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          context: item.context,
          options: item.options ?? [],
          status: item.status,
          outcome: item.outcome,
          dueDate: item.dueDate,
          projectName: item.projectId ? byId.get(item.projectId)?.name : null,
        }))}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        defaultProjectId={projectId}
      />
    </div>
  );
}
