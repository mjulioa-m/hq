"use client";

import {
  Bell,
  BookOpen,
  HeartPulse,
  CheckSquare,
  Clapperboard,
  House,
  Scale,
  ScrollText,
  BadgeDollarSign,
  SquareKanban,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DockMore } from "@/components/shell/DockMore";
import { cn } from "@/lib/cn";
import { SHOW_FINANCE, SHOW_SALES } from "@/lib/constants";

export type DockItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  badge?: "tasks" | "decisions" | "reminders";
};

const PRIMARY: DockItem[] = [
  { href: "/", label: "Inicio", icon: House, match: (pathname) => pathname === "/" },
  { href: "/tareas", label: "Tareas", icon: CheckSquare, match: (pathname) => pathname.startsWith("/tareas") || pathname.startsWith("/diario"), badge: "tasks" },
  { href: "/presion", label: "Presión", icon: HeartPulse, match: (pathname) => pathname.startsWith("/presion") },
  { href: "/recordatorios", label: "Avisos", icon: Bell, match: (pathname) => pathname.startsWith("/recordatorios"), badge: "reminders" },
  { href: "/contenido", label: "Contenido", icon: Clapperboard, match: (pathname) => pathname.startsWith("/contenido") },
];

const MORE: DockItem[] = [
  { href: "/proyectos", label: "Proyectos", icon: SquareKanban, match: (pathname) => pathname.startsWith("/proyectos") },
  ...(SHOW_SALES
    ? [{ href: "/ventas", label: "Ventas", icon: BadgeDollarSign, match: (pathname: string) => pathname.startsWith("/ventas") } satisfies DockItem]
    : []),
  ...(SHOW_FINANCE
    ? [{ href: "/finanzas", label: "Finanzas", icon: Wallet, match: (pathname: string) => pathname.startsWith("/finanzas") } satisfies DockItem]
    : []),
  { href: "/decidir", label: "Decidir", icon: Scale, match: (pathname) => pathname.startsWith("/decidir"), badge: "decisions" },
  { href: "/aprendido", label: "Aprendido", icon: BookOpen, match: (pathname) => pathname.startsWith("/aprendido") },
  { href: "/skills", label: "Skills", icon: ScrollText, match: (pathname) => pathname.startsWith("/skills") },
];

export function Dock({ counts }: { counts: { tasks: number; decisions: number; reminders: number } }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-white/[0.08] bg-black/55 px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:inset-x-auto md:bottom-4 md:left-1/2 md:w-max md:-translate-x-1/2 md:overflow-visible md:rounded-full md:border md:bg-black/40 md:px-1.5 md:py-1 md:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="flex w-full items-end justify-around md:w-max md:gap-0.5">
        {PRIMARY.map((item) => (
          <DockButton key={item.href} item={item} active={item.match(pathname)} count={item.badge ? counts[item.badge] : 0} />
        ))}
        <DockMore items={MORE} badge={counts.decisions} />
      </div>
    </nav>
  );
}

export function DockButton({
  item,
  active,
  count,
}: {
  item: DockItem;
  active: boolean;
  count: number;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative grid h-12 w-14 place-items-center rounded-full text-xs text-ink-2 transition-colors duration-150 ease-out hover:bg-surface-2",
        active && "bg-white/15 text-ink"
      )}
    >
      <Icon size={20} />
      <span className="mt-0.5">{item.label}</span>
      {count > 0 ? (
        <span className="absolute top-1 right-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-ink">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
