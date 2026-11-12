"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useUi } from "@/lib/store";

export function ProjectSwitcher({
  projects,
}: {
  projects: { slug: string; name: string; color: string }[];
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const active = useUi((s) => s.activeProject);
  const setActive = useUi((s) => s.setActiveProject);
  const fromUrl = params.get("p") || "todos";
  const [optimistic, setOptimistic] = useState<string | null>(null);
  if (optimistic && optimistic === fromUrl) setOptimistic(null);

  useEffect(() => {
    if (optimistic && optimistic !== fromUrl) return;
    if (fromUrl !== "todos") {
      if (fromUrl !== active) setActive(fromUrl);
      return;
    }
    if (active !== "todos") {
      const next = new URLSearchParams(params.toString());
      next.set("p", active);
      router.replace(`${pathname}?${next.toString()}`);
    }
  }, [active, fromUrl, optimistic, params, pathname, router, setActive]);

  function choose(slug: string) {
    setOptimistic(slug);
    setActive(slug);
    const next = new URLSearchParams(params.toString());
    if (slug === "todos") next.delete("p");
    else next.set("p", slug);
    const q = next.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  const current = optimistic && optimistic !== fromUrl ? optimistic : fromUrl;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => choose("todos")}
        className={cn(
          "h-8 rounded-full px-3 text-xs",
          current === "todos" ? "bg-accent text-accent-ink" : "bg-white/5 text-ink-2"
        )}
      >
        Todos
      </button>
      {projects.map((project) => (
        <button
          key={project.slug}
          type="button"
          onClick={() => choose(project.slug)}
          className={cn(
            "h-8 rounded-full px-3 text-xs",
            current === project.slug ? "text-accent-ink" : "text-ink-2"
          )}
          style={{
            background: current === project.slug ? project.color : "rgb(255 255 255 / 0.05)",
          }}
        >
          {project.name}
        </button>
      ))}
    </div>
  );
}
