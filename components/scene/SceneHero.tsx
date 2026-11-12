"use client";

import { useState } from "react";
import { AmbientParticles } from "@/components/scene/AmbientParticles";
import { SceneImage } from "@/components/scene/SceneImage";
import { getScene } from "@/components/scene/scenes";
import { cn } from "@/lib/cn";

export function SceneHero({
  scene: sceneSlug,
  title,
  subtitle,
  kicker,
  children,
  className,
}: {
  scene: string;
  title: string;
  subtitle?: string;
  kicker?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const scene = getScene(sceneSlug);
  const [failed, setFailed] = useState(false);
  return (
    <section
      className={cn("relative h-[88px] overflow-hidden rounded-[22px] sm:h-[104px]", className)}
      style={{ background: scene.fallbackGradient }}
    >
      {failed ? null : (
        <SceneImage scene={scene} fit="cover" className="absolute inset-0" onError={() => setFailed(true)} />
      )}
      <AmbientParticles kind={scene.ambient} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.28)_28%,transparent_56%)]" />
      <div className="relative flex h-full flex-col justify-end p-4 sm:p-6">
        {kicker ? <p className="mb-1 text-sm text-white/70">{kicker}</p> : null}
        <h1 className="display text-2xl text-white sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-white/70">{subtitle}</p> : null}
        {children}
      </div>
    </section>
  );
}

export function SceneThumb({
  scene: sceneSlug,
  className,
}: {
  scene: string;
  className?: string;
}) {
  const scene = getScene(sceneSlug);
  const [failed, setFailed] = useState(false);
  const fill = className?.includes("absolute");
  return (
    <div
      className={cn(fill ? "absolute" : "relative", "w-full overflow-hidden", className)}
      style={{ background: scene.fallbackGradient }}
    >
      {failed ? null : (
        <SceneImage scene={scene} fit="cover" className="absolute inset-0 h-auto" onError={() => setFailed(true)} />
      )}
      <AmbientParticles kind={scene.ambient} />
    </div>
  );
}
