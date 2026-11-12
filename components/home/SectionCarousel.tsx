"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SceneThumb } from "@/components/scene/SceneHero";
import { useUi } from "@/lib/store";
import { cn } from "@/lib/cn";

export type Slide = {
  key: string;
  title: string;
  href: string;
  scene: string;
  badge?: string;
};

export function SectionCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const setScene = useUi((s) => s.setSceneOverride);

  useEffect(() => {
    setScene(slides[index]?.scene ?? null);
    return () => setScene(null);
  }, [index, setScene, slides]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + slides.length) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  function offset(i: number) {
    let d = i - index;
    const n = slides.length;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  return (
    <div
      className="relative mt-4 h-[320px] sm:h-[480px]"
      onTouchStart={(e) => {
        const x = e.changedTouches[0].clientX;
        (e.currentTarget as HTMLDivElement).dataset.x = String(x);
      }}
      onTouchEnd={(e) => {
        const start = Number((e.currentTarget as HTMLDivElement).dataset.x || 0);
        const dx = e.changedTouches[0].clientX - start;
        if (dx < -40) setIndex((i) => (i + 1) % slides.length);
        if (dx > 40) setIndex((i) => (i - 1 + slides.length) % slides.length);
      }}
    >
      {slides.map((slide, i) => {
        const d = offset(i);
        const visible = Math.abs(d) <= 1;
        return (
          <article
            key={slide.key}
            className={cn(
              "absolute top-0 left-1/2 h-full w-[calc(100%-0.5rem)] overflow-hidden rounded-[22px] transition-all duration-500 sm:w-[calc(100%-1.25rem)]",
              !visible && "pointer-events-none opacity-0"
            )}
            data-motion-sensitive
            aria-hidden={d !== 0}
            style={{
              transform: `translateX(calc(-50% + ${d * 97}%)) scale(${d === 0 ? 1 : 0.96})`,
              opacity: d === 0 ? 1 : visible ? 0.85 : 0,
              filter: d === 0 ? "none" : "blur(2px)",
              zIndex: 10 - Math.abs(d),
            }}
          >
            <SceneThumb scene={slide.scene} className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            {slide.badge ? (
              <span className="absolute top-4 right-4 rounded-full bg-black/45 px-3 py-1 text-xs backdrop-blur">
                {slide.badge}
              </span>
            ) : null}
            <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
              <h2 className="display text-3xl text-white sm:text-5xl">{slide.title}</h2>
              {d === 0 ? (
                <Link href={slide.href} aria-label={`Entrar a ${slide.title}`} className="rounded-[10px] bg-accent px-4 py-2 text-sm font-medium text-accent-ink">
                  Entrar →
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute top-1/2 left-2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 transition-colors duration-150 hover:bg-black/60 sm:left-5"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute top-1/2 right-2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 transition-colors duration-150 hover:bg-black/60 sm:right-5"
      >
        <ChevronRight size={18} />
      </button>
      <div className="absolute bottom-[-28px] left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            aria-label={slide.title}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
            className="grid h-6 w-6 place-items-center"
          >
            <span className={cn("h-1.5 rounded-full bg-white/70", i === index ? "w-6" : "w-1.5 bg-white/35")} />
          </button>
        ))}
      </div>
    </div>
  );
}
