"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock } from "@/components/shell/Clock";
import { MotionToggle } from "@/components/shell/MotionToggle";
import { ProjectSwitcher } from "@/components/shell/ProjectSwitcher";
import { todayISO } from "@/lib/dates";

const CrumbState = {
  trail: [] as string[],
  listeners: new Set<() => void>(),
  set(trail: string[]) {
    CrumbState.trail = trail;
    CrumbState.listeners.forEach((fn) => fn());
  },
};

export function CrumbSetter({ trail }: { trail: string[] }) {
  const key = trail.join("|");
  useEffect(() => {
    CrumbState.set(key ? key.split("|") : []);
    return () => CrumbState.set([]);
  }, [key]);
  return null;
}

function useTrail() {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    CrumbState.listeners.add(fn);
    return () => {
      CrumbState.listeners.delete(fn);
    };
  }, []);
  return CrumbState.trail;
}

const LABELS: Record<string, string> = {
  tareas: "Tareas diarias",
  diario: "Diario",
  proyectos: "Proyectos",
  contenido: "Creación de contenido",
  ventas: "Ventas",
  finanzas: "Finanzas",
  decidir: "Decidir",
  recordatorios: "Recordatorios",
  presion: "Tamizaje",
  aprendido: "Aprendido",
  skills: "Skills",
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  pieza: "Pieza",
  contacto: "Contacto",
};

export function TopBar({
  projects,
}: {
  projects: { slug: string; name: string; color: string }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const extra = useTrail();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = ["Inicio", ...parts.map((p) => LABELS[p] ?? decodeURIComponent(p)), ...extra].filter(
    (label, index, all) => (index === 0 ? pathname !== "/" || all.length === 1 : true)
  );
  if (pathname === "/") crumbs.splice(0, crumbs.length, "Inicio");

  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-ink-2">
            <Link href="/" className="font-semibold text-ink">
              HQ
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb}>
                {" / "}
                {crumb}
              </span>
            ))}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Clock />
          <Link href={`/diario/${todayISO()}`} className="glass hidden h-10 items-center px-3 text-sm sm:inline-flex">
            Diario de hoy
          </Link>
          <MotionToggle />
          <button
            type="button"
            onClick={() => router.refresh()}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5"
            aria-label="Actualizar"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <ProjectSwitcher projects={projects} />
      </div>
    </header>
  );
}
