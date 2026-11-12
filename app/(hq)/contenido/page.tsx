import Link from "next/link";
import { SceneHero } from "@/components/scene/SceneHero";
import { platformCounts } from "@/lib/content";
import { PLATFORMS } from "@/lib/content-stages";
import { resolveProjectId } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ContenidoPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const projectId = await resolveProjectId(p);
  const query = p ? `?p=${encodeURIComponent(p)}` : "";
  const cards = await Promise.all(
    PLATFORMS.map(async (platform) => ({
      platform,
      counts: platform.available ? await platformCounts(platform.slug, projectId) : null,
    }))
  );
  return (
    <div>
      <SceneHero scene="contenido" title="Creación de contenido" subtitle="De la idea al publicado, por plataforma." />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {cards
          .filter(({ platform }) => platform.available)
          .map(({ platform, counts }) => (
            <Link key={platform.slug} href={`/contenido/${platform.slug}${query}`} className="glass overflow-hidden">
              <div className="p-4">
                <h2 className="display text-2xl">{platform.name}</h2>
                <p className="mt-1 text-sm text-ink-2">{platform.blurb}</p>
                <dl className="mt-4 grid grid-cols-3 text-center text-xs text-ink-3">
                  <div>
                    <dt>Ideas</dt>
                    <dd className="text-lg text-ink">{counts?.ideas ?? 0}</dd>
                  </div>
                  <div>
                    <dt>En marcha</dt>
                    <dd className="text-lg text-ink">{counts?.active ?? 0}</dd>
                  </div>
                  <div>
                    <dt>Publicados</dt>
                    <dd className="text-lg text-ink">{counts?.published ?? 0}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-right text-sm text-accent">Entrar →</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
