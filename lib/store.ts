"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  motion: boolean;
  activeProject: string;
  sceneOverride: string | null;
  setMotion: (motion: boolean) => void;
  setActiveProject: (activeProject: string) => void;
  setSceneOverride: (sceneOverride: string | null) => void;
};

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      motion: true,
      activeProject: "todos",
      sceneOverride: null,
      setMotion: (motion) => {
        document.documentElement.dataset.motion = motion ? "on" : "off";
        set({ motion });
      },
      setActiveProject: (activeProject) => set({ activeProject }),
      setSceneOverride: (sceneOverride) => set({ sceneOverride }),
    }),
    {
      name: "hq-ui",
      partialize: (state) => ({ motion: state.motion, activeProject: state.activeProject }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        document.documentElement.dataset.motion = state.motion ? "on" : "off";
      },
    }
  )
);
