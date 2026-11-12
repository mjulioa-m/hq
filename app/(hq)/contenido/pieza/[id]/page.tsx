import Link from "next/link";
import { notFound } from "next/navigation";
import { PieceStepper } from "@/components/content/PieceStepper";
import { SceneHero } from "@/components/scene/SceneHero";
import { CrumbSetter } from "@/components/shell/TopBar";
import { getPiece, listAssets, listStageNotes } from "@/lib/content";
import { PLATFORMS, stagesFor } from "@/lib/content-stages";

export const dynamic = "force-dynamic";

export default async function PiezaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const piece = await getPiece(id);
  if (!piece) notFound();
  const [notes, assets] = await Promise.all([listStageNotes(piece.id), listAssets(piece.id)]);
  const name = PLATFORMS.find((p) => p.slug === piece.platform)?.name ?? piece.platform;
  return (
    <div>
      <CrumbSetter trail={[piece.title]} />
      <SceneHero
        scene="contenido"
        kicker={`Creación de contenido › ${name} ›`}
        title={piece.title}
        subtitle={piece.status.replace("_", " ")}
      />
      <p className="mt-3 text-sm">
        <Link href={`/contenido/${piece.platform}?tab=piezas`} className="text-ink-2">
          ← Volver a {name}
        </Link>
      </p>
      <div className="mt-4">
        <PieceStepper
          pieceId={piece.id}
          stages={stagesFor(piece.platform)}
          current={piece.currentStage}
          notes={notes.map((n) => ({ stage: n.stage, content: n.content, done: n.done }))}
          assets={assets.map((a) => ({
            id: a.id,
            kind: a.kind,
            label: a.label,
            url: a.url,
            filePath: a.filePath,
            isChosen: a.isChosen,
            stage: a.stage,
          }))}
        />
      </div>
    </div>
  );
}
