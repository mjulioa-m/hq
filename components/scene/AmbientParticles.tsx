"use client";

import { useEffect, useRef } from "react";
import type { Ambient } from "@/components/scene/scenes";
import { useUi } from "@/lib/store";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  life: number;
};

function spawn(kind: Ambient, w: number, h: number): Particle {
  const x = Math.random() * w;
  const y = Math.random() * h;
  if (kind === "rain") {
    return { x, y: Math.random() * h, r: 1, vx: -0.4, vy: 3 + Math.random() * 3, a: 0.35, life: 1 };
  }
  if (kind === "leaves") {
    return { x, y: -10, r: 2 + Math.random() * 2, vx: 0.3, vy: 0.4 + Math.random() * 0.5, a: 0.55, life: 1 };
  }
  if (kind === "ripples") {
    return { x, y, r: 2, vx: 0, vy: 0, a: 0.45, life: 0 };
  }
  if (kind === "stars") {
    return { x, y, r: Math.random() * 1.4 + 0.3, vx: 0, vy: 0, a: Math.random(), life: Math.random() * 6 };
  }
  return {
    x,
    y,
    r: kind === "fireflies" ? 1.6 : 1.1,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -0.15 - Math.random() * 0.25,
    a: Math.random() * 0.6,
    life: Math.random() * 8,
  };
}

export function AmbientParticles({ kind }: { kind: Ambient }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useUi((s) => s.motion);

  useEffect(() => {
    if (!motion || kind === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let particles: Particle[] = [];
    let frame = 0;
    let raf = 0;
    let running = true;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
      particles = Array.from({ length: 42 }, () => spawn(kind, canvas.width, canvas.height));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    const onVis = () => {
      running = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame += 1;
      if (!running || frame % 2 !== 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.life += 0.03;
        if (kind === "rain") {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y > canvas.height) {
            p.y = -8;
            p.x = Math.random() * canvas.width;
          }
          ctx.strokeStyle = `rgba(214, 228, 242, ${p.a})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3, p.y + 10);
          ctx.stroke();
          continue;
        }
        if (kind === "ripples") {
          p.life += 0.04;
          const radius = (p.life % 4) * 14;
          const alpha = Math.max(0, 0.35 - (p.life % 4) * 0.08);
          ctx.strokeStyle = `rgba(186, 230, 210, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          continue;
        }
        if (kind === "stars") {
          const tw = 0.25 + Math.abs(Math.sin(p.life)) * 0.75;
          ctx.fillStyle = `rgba(255, 244, 220, ${tw})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        if (kind === "leaves") {
          p.x += p.vx + Math.sin(p.life) * 0.3;
          p.y += p.vy;
          if (p.y > canvas.height + 8) {
            p.y = -8;
            p.x = Math.random() * canvas.width;
          }
          ctx.fillStyle = `rgba(196, 168, 110, ${p.a})`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.r, p.r * 0.55, p.life, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -6) p.y = canvas.height + 4;
        if (p.x < -6) p.x = canvas.width + 4;
        if (p.x > canvas.width + 6) p.x = -4;
        const blink = kind === "fireflies" ? 0.25 + Math.abs(Math.sin(p.life * 1.4)) * 0.75 : 0.45;
        ctx.fillStyle =
          kind === "fireflies"
            ? `rgba(210, 245, 160, ${blink})`
            : `rgba(255, 236, 214, ${0.25 * blink})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [kind, motion]);

  if (!motion || kind === "none") return null;
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" data-anim />;
}
