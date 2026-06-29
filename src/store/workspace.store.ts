import { create } from "zustand";
import type { Document } from "@/types";

/**
 * Global workspace state: document list mirror and open tabs.
 */

interface WorkspaceState {
  documents: Document[];
  openedTabs: string[];
  activeDocumentId: string | null;

  setDocuments: (documents: Document[]) => void;

  openTab: (documentId: string) => void;
  closeTab: (documentId: string) => void;
  setActiveDocument: (documentId: string) => void;
  syncOpenedTabs: (validDocumentIds: string[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  documents: [],
  openedTabs: [],
  activeDocumentId: null,

  setDocuments: (documents) => set({ documents }),

  openTab: (documentId) =>
    set((state) => {
      const openedTabs = state.openedTabs.includes(documentId)
        ? state.openedTabs
        : [...state.openedTabs, documentId];

      return {
        openedTabs,
        activeDocumentId: documentId,
      };
    }),

  closeTab: (documentId) =>
    set((state) => {
      const tabIndex = state.openedTabs.indexOf(documentId);
      const openedTabs = state.openedTabs.filter((id) => id !== documentId);

      let activeDocumentId = state.activeDocumentId;
      if (activeDocumentId === documentId) {
        const nextIndex = Math.min(tabIndex, openedTabs.length - 1);
        activeDocumentId = openedTabs[nextIndex] ?? null;
      }

      return { openedTabs, activeDocumentId };
    }),

  setActiveDocument: (documentId) => set({ activeDocumentId: documentId }),

  /** Removes tab IDs that no longer exist in the document list; fixes active tab if needed. */
  syncOpenedTabs: (validDocumentIds) =>
    set((state) => {
      const valid = new Set(validDocumentIds);
      const openedTabs = state.openedTabs.filter((id) => valid.has(id));

      let activeDocumentId = state.activeDocumentId;
      if (!activeDocumentId || !valid.has(activeDocumentId)) {
        activeDocumentId = openedTabs[openedTabs.length - 1] ?? null;
      }

      if (
        openedTabs.length === state.openedTabs.length &&
        activeDocumentId === state.activeDocumentId
      ) {
        return state;
      }

      return { openedTabs, activeDocumentId };
    }),
}));
