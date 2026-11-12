import { notFound, redirect } from "next/navigation";
import { ContactForm } from "@/components/sales/ContactForm";
import { PipelineBoard } from "@/components/sales/PipelineBoard";
import { SceneHero } from "@/components/scene/SceneHero";
import { SHOW_SALES } from "@/lib/constants";
import { listContacts } from "@/lib/contacts";
import { getProjectBySlug } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function VentasProyectoPage({ params }: { params: Promise<{ projectSlug: string }> }) {
  if (!SHOW_SALES) redirect("/");
  const { projectSlug } = await params;
  if (projectSlug === "contacto") notFound();
  const project = await getProjectBySlug(projectSlug);
  if (!project) notFound();
  const contacts = await listContacts(project.id);
  return (
    <div>
      <SceneHero scene={project.sceneSlug} kicker="Ventas ›" title={project.name} subtitle="Pipeline de contactos" />
      <div className="mt-4 mb-4">
        <ContactForm projectId={project.id} />
      </div>
      <PipelineBoard
        contacts={contacts.map((c) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          stage: c.stage,
          value: c.value,
          nextAction: c.nextAction,
          nextActionDate: c.nextActionDate,
        }))}
      />
    </div>
  );
}
