"use client";

import { useEffect, useState } from "react";
import { formatClock, formatLong, todayISO } from "@/lib/dates";

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  const date = now ?? new Date();
  return (
    <div className="text-right">
      <p className="display text-4xl leading-none tabular-nums">{now ? formatClock(date) : "––:––"}</p>
      <p className="mt-1 text-xs text-ink-2">{formatLong(todayISO(date))}</p>
    </div>
  );
}
