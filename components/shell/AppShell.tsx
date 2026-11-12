"use client";

import { Suspense } from "react";
import { Dock } from "@/components/shell/Dock";
import { TopBar } from "@/components/shell/TopBar";
import { SceneBackground } from "@/components/scene/SceneBackground";
import { ToastProvider } from "@/components/ui/Toast";

export function AppShell({
  projects,
  counts,
  children,
}: {
  projects: { slug: string; name: string; color: string }[];
  counts: { tasks: number; decisions: number; reminders: number };
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <SceneBackground />
      <div className="mx-auto min-h-screen w-full max-w-7xl px-3 pt-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-5 md:pb-28">
        <Suspense fallback={null}>
          <TopBar projects={projects} />
        </Suspense>
        {children}
      </div>
      <Dock counts={counts} />
    </ToastProvider>
  );
}
