"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import type { DockItem } from "@/components/shell/Dock";
import { cn } from "@/lib/cn";

export function DockMore({ items, badge }: { items: DockItem[]; badge: number }) {
  const [openOn, setOpenOn] = useState<string | null>(null);
  const pathname = usePathname();
  const open = openOn === pathname;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = items.some((item) => item.match(pathname));

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenOn(null);
        rootRef.current?.querySelector("button")?.focus();
      }
    }
    function onPointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpenOn(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="dock-more"
        aria-haspopup="true"
        onClick={() => setOpenOn(open ? null : pathname)}
        className={cn(
          "relative grid h-12 w-14 place-items-center rounded-full text-[10px] text-ink-2 transition-colors duration-150 ease-out hover:bg-surface-2",
          (open || active) && "bg-white/15 text-ink"
        )}
      >
        <LayoutGrid size={20} />
        <span className="mt-0.5">Más</span>
        {badge > 0 ? (
          <span className="absolute top-1 right-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-ink">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id="dock-more"
              className="glass-strong shadow-soft fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 grid grid-cols-3 gap-1 p-2 md:bottom-24 md:left-1/2 md:right-auto md:w-[420px] md:-translate-x-1/2"
            >
              {items.map((item) => {
                const Icon = item.icon;
                const current = item.match(pathname);
                const count = item.badge === "decisions" ? badge : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "relative grid h-16 place-items-center rounded-2xl text-[11px] text-ink-2 transition-colors duration-150 ease-out hover:bg-surface-2",
                      current && "bg-white/15 text-ink"
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {count > 0 ? (
                      <span className="absolute top-2 right-3 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-ink">
                        {count > 9 ? "9+" : count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
