import { notFound } from "next/navigation";
import { IdeasPanel } from "@/components/content/IdeasPanel";
import { InvestigationPanel } from "@/components/content/InvestigationPanel";
import { MetricsChart, MetricsEditor } from "@/components/content/MetricsPanel";
import { PiecesPanel } from "@/components/content/PiecesPanel";
import { ReferenceForm } from "@/components/content/ReferenceForm";
import { SceneHero } from "@/components/scene/SceneHero";
import { StatCard, StatRow } from "@/components/ui/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import { listPieces, listReferences, publishedByMonth, referenceFunnel, sinceFromRange } from "@/lib/content";
import { PIECE_STATUSES, PLATFORMS, REFERENCE_TAGS, isPlatform } from "@/lib/content-stages";
import { lastMonths } from "@/lib/dates";
import { resolveProjectId } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function PlatformPage({
  params,
  searchParams,
}: {
  params: Promise<{ platform: string }>;
  searchParams: Promise<{ p?: string; tab?: string; tag?: string; rango?: string; estado?: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform) || platform === "facebook") notFound();
  const sp = await searchParams;
  const meta = PLATFORMS.find((item) => item.slug === platform);
  const projectId = await resolveProjectId(sp.p);
  const tab = sp.tab ?? "investigacion";
  const since = sinceFromRange(sp.rango);
  const base = new URLSearchParams();
  if (sp.p) base.set("p", sp.p);
  const href = (extra: Record<string, string>) => {
    const q = new URLSearchParams(base);
    for (const [k, v] of Object.entries(extra)) q.set(k, v);
    return `/contenido/${platform}?${q.toString()}`;
  };
  const funnel = await referenceFunnel(platform, projectId, since);
  const videoLabel = platform === "youtube" ? "En vídeo" : "En marcha";

  return (
    <div>
      <SceneHero scene="contenido" kicker="Creación de contenido ›" title={meta?.name ?? platform} />
      <div className="mt-4">
        <Tabs
          items={[
            { href: href({ tab: "investigacion" }), label: "Investigación", active: tab === "investigacion" },
            { href: href({ tab: "ideas" }), label: "Ideas", active: tab === "ideas", count: funnel.ideas },
            { href: href({ tab: "piezas" }), label: "Piezas", active: tab === "piezas", count: funnel.enMarcha },
            { href: href({ tab: "metricas" }), label: "Métricas", active: tab === "metricas" },
          ]}
        />
      </div>
      <div className="mt-4">
        {tab === "investigacion" ? (
          <Investigation
            platform={platform}
            projectId={projectId}
            funnel={funnel}
            videoLabel={videoLabel}
            tag={sp.tag ?? "competencia"}
            rango={sp.rango ?? "todo"}
            href={href}
          />
        ) : null}
        {tab === "ideas" ? (
          <IdeasPanel
            platform={platform}
            projectId={projectId}
            ideas={(await listPieces({ platform, projectId, status: "en_marcha" }))
              .filter((p) => p.currentStage === "idea")
              .map((p) => ({ id: p.id, title: p.title }))}
          />
        ) : null}
        {tab === "piezas" ? (
          <PiecesTab platform={platform} projectId={projectId} estado={sp.estado ?? "en_marcha"} href={href} />
        ) : null}
        {tab === "metricas" ? <MetricsTab platform={platform} projectId={projectId} /> : null}
      </div>
    </div>
  );
}

async function Investigation({
  platform,
  projectId,
  funnel,
  videoLabel,
  tag,
  rango,
  href,
}: {
  platform: string;
  projectId: string | null;
  funnel: Awaited<ReturnType<typeof referenceFunnel>>;
  videoLabel: string;
  tag: string;
  rango: string;
  href: (extra: Record<string, string>) => string;
}) {
  const since = sinceFromRange(rango === "todo" ? null : rango);
  const refs = await listReferences({ platform, projectId, tag, since });
  return (
    <div className="space-y-4">
      <StatRow>
        <StatCard label="Captado" value={funnel.captado} hint={`${funnel.captadoHoy} hoy`} />
        <StatCard label="Revisado" value={funnel.revisado} hint={funnel.revisado === funnel.captado ? "al día" : "pendientes"} />
        <StatCard label="Útil" value={funnel.util} hint={`${funnel.descartado} descartado`} />
        <StatCard label="Ideas activas" value={funnel.ideas} hint="ver ideas" />
        <StatCard label={videoLabel} value={funnel.enMarcha} hint="en marcha" />
      </StatRow>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          items={REFERENCE_TAGS.map((item) => ({
            href: href({ tab: "investigacion", tag: item.id, rango }),
            label: item.label,
            active: tag === item.id,
          }))}
        />
        <Tabs
          items={[
            { href: href({ tab: "investigacion", tag, rango: "7" }), label: "7 días", active: rango === "7" },
            { href: href({ tab: "investigacion", tag, rango: "30" }), label: "30 días", active: rango === "30" },
            { href: href({ tab: "investigacion", tag, rango: "todo" }), label: "Todo", active: rango === "todo" },
          ]}
        />
      </div>
      <ReferenceForm platform={platform} projectId={projectId} />
      <InvestigationPanel
        items={refs.map((r) => ({
          id: r.id,
          title: r.title,
          author: r.author,
          views: r.views,
          url: r.url,
          publishedOn: r.publishedOn,
          createdAt: r.createdAt.toISOString(),
          useful: r.useful,
        }))}
      />
    </div>
  );
}

async function PiecesTab({
  platform,
  projectId,
  estado,
  href,
}: {
  platform: string;
  projectId: string | null;
  estado: string;
  href: (extra: Record<string, string>) => string;
}) {
  const pieces = await listPieces({ platform, projectId, status: estado });
  const all = await listPieces({ platform, projectId });
  return (
    <div className="space-y-4">
      <Tabs
        items={PIECE_STATUSES.map((status) => ({
          href: href({ tab: "piezas", estado: status.id }),
          label: status.label,
          active: estado === status.id,
          count: all.filter((p) => p.status === status.id).length,
        }))}
      />
      <PiecesPanel pieces={pieces} platform={platform} projectId={projectId} />
    </div>
  );
}

async function MetricsTab({ platform, projectId }: { platform: string; projectId: string | null }) {
  const months = lastMonths(6);
  const rows = await publishedByMonth(platform, projectId);
  const published = (await listPieces({ platform, projectId, status: "publicado" })).map((p) => ({
    id: p.id,
    title: p.title,
    metrics: p.metrics ?? {},
  }));
  return (
    <div className="space-y-4">
      <section className="glass p-4">
        <h2 className="mb-2 text-sm text-ink-2">Publicados por mes</h2>
        <MetricsChart months={months} rows={rows} />
      </section>
      <section className="glass overflow-x-auto p-4">
        <table className="w-full text-left">
          <thead className="text-xs text-ink-3 uppercase">
            <tr>
              <th className="px-3 py-2">Pieza</th>
              <th>Vistas</th>
              <th>Likes</th>
              <th>Comentarios</th>
              <th>Actual</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {published.map((piece) => (
              <MetricsEditor key={piece.id} piece={piece} />
            ))}
          </tbody>
        </table>
        {published.length === 0 ? <p className="text-sm text-ink-3">Todavía no hay publicados.</p> : null}
      </section>
    </div>
  );
}
