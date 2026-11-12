"use client";

import { useEffect } from "react";

export function ThemeBoot() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hq-ui");
      let motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { motion?: boolean } };
        if (typeof parsed.state?.motion === "boolean") motion = parsed.state.motion;
      }
      document.documentElement.dataset.motion = motion ? "on" : "off";
    } catch {
      document.documentElement.dataset.motion = "on";
    }
  }, []);
  return null;
}
