import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactEditor } from "@/components/sales/ContactEditor";
import { SceneHero } from "@/components/scene/SceneHero";
import { CrumbSetter } from "@/components/shell/TopBar";
import { SHOW_SALES } from "@/lib/constants";
import { getContact, listActivities } from "@/lib/contacts";
import { getProjectById } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ContactoPage({ params }: { params: Promise<{ id: string }> }) {
  if (!SHOW_SALES) redirect("/");
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();
  const project = contact.projectId ? await getProjectById(contact.projectId) : null;
  const activities = await listActivities(contact.id);
  return (
    <div>
      <CrumbSetter trail={[contact.name]} />
      <SceneHero scene={project?.sceneSlug ?? "ventas"} kicker="Ventas ›" title={contact.name} subtitle={contact.company} />
      {project ? (
        <p className="mt-3 text-sm">
          <Link href={`/ventas/${project.slug}`} className="text-ink-2">
            ← Volver a {project.name}
          </Link>
        </p>
      ) : null}
      <div className="mt-4">
        <ContactEditor
          contact={contact}
          activities={activities.map((a) => ({
            id: a.id,
            type: a.type,
            summary: a.summary,
            happenedAt: a.happenedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
