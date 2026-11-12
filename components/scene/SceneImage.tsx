"use client";

import type { Scene } from "@/components/scene/scenes";
import { cn } from "@/lib/cn";
import { useUi } from "@/lib/store";

export function SceneImage({
  scene,
  className,
  fit = "cover",
  onError,
}: {
  scene: Scene;
  className?: string;
  fit?: "cover" | "contain";
  onError?: () => void;
}) {
  const motion = useUi((s) => s.motion);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={motion ? "play" : "still"}
      src={motion ? scene.image : scene.still}
      alt=""
      className={cn(
        "h-full w-full",
        fit === "contain" ? "object-contain" : "object-cover",
        scene.pixelated && "pixelated",
        className,
      )}
      onError={onError}
    />
  );
}
