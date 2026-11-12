"use client";

import { Pause, Play } from "lucide-react";
import { useUi } from "@/lib/store";

export function MotionToggle() {
  const motion = useUi((s) => s.motion);
  const setMotion = useUi((s) => s.setMotion);
  return (
    <button
      type="button"
      onClick={() => setMotion(!motion)}
      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink"
      aria-label={motion ? "Detener el movimiento" : "Reanudar el movimiento"}
      title={motion ? "Detener el movimiento" : "Reanudar el movimiento"}
    >
      {motion ? <Pause size={16} /> : <Play size={16} />}
    </button>
  );
}
