"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AmbientParticles } from "@/components/scene/AmbientParticles";
import { SceneImage } from "@/components/scene/SceneImage";
import { getScene, sceneForPath } from "@/components/scene/scenes";
import { useUi } from "@/lib/store";

export function SceneBackground() {
  const pathname = usePathname();
  const override = useUi((s) => s.sceneOverride);
  const scene = getScene(sceneForPath(pathname, override));
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = failed !== scene.slug;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ background: scene.fallbackGradient }}
      />
      {showImage ? (
        <div
          key={scene.slug}
          className="absolute -inset-[6%] transition-opacity duration-700"
          style={{ filter: "blur(28px) brightness(0.42) saturate(1.2)" }}
        >
          <SceneImage scene={scene} className="absolute inset-0 h-auto" onError={() => setFailed(scene.slug)} />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.5)_68%,rgba(0,0,0,0.72)_100%)]" />
      <AmbientParticles kind={scene.ambient} />
    </div>
  );
}
