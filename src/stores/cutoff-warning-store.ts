"use client";
import { create } from "zustand";
import type { CutoffWarningNotification } from "@/api/cutoff-warnings";

/**
 * Shared between the workspace-wide SSE listener (toasts) and the Emergency page (live table),
 * so the browser keeps a single stream open.
 */
type CutoffWarningFeed = {
  connected: boolean;
  /** Bumped on every notification and on each (re)connect; the page refetches when it changes. */
  version: number;
  /** Warnings raised since the page was opened, to highlight new rows. */
  freshIds: string[];
  setConnected: (connected: boolean) => void;
  receive: (notification: CutoffWarningNotification) => void;
  resync: () => void;
};

export const useCutoffWarningFeed = create<CutoffWarningFeed>((set) => ({
  connected: false,
  version: 0,
  freshIds: [],
  setConnected: (connected) => set({ connected }),
  receive: (notification) =>
    set((state) => ({
      version: state.version + 1,
      freshIds: notification.kind === "CutoffWarningRaised"
        ? [notification.warningId, ...state.freshIds.filter((id) => id !== notification.warningId)].slice(0, 50)
        : state.freshIds,
    })),
  resync: () => set((state) => ({ version: state.version + 1 })),
}));
