import { useEffect, useMemo } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { useWorkspaceStore } from "@/store/workspace.store";
import { canPreviewDocument } from "@/utils/document-status";

/**
 * Workspace viewer state: open tabs, active document, and preview eligibility.
 *
 * - Syncs `openedTabs` with the current document list (drops stale IDs).
 * - Exposes only tabs whose documents still exist (`visibleTabs`).
 * - Surfaces whether the active tab can render a PDF (`canPreviewActive`).
 */
export const useWorkspaceTabs = () => {
  const { documents, isLoading } = useDocuments();

  const openedTabs = useWorkspaceStore((state) => state.openedTabs);
  const activeDocumentId = useWorkspaceStore((state) => state.activeDocumentId);
  const openTab = useWorkspaceStore((state) => state.openTab);
  const closeTab = useWorkspaceStore((state) => state.closeTab);
  const setActiveDocument = useWorkspaceStore((state) => state.setActiveDocument);
  const syncOpenedTabs = useWorkspaceStore((state) => state.syncOpenedTabs);

  const documentIds = useMemo(
    () => documents.map((document) => document.id),
    [documents]
  );

  const visibleTabs = useMemo(
    () => openedTabs.filter((tabId) => documentIds.includes(tabId)),
    [openedTabs, documentIds]
  );

  useEffect(() => {
    if (documentIds.length === 0) return;
    syncOpenedTabs(documentIds);
  }, [documentIds, syncOpenedTabs]);

  const activeDocument =
    documents.find((document) => document.id === activeDocumentId) ?? null;

  const canPreviewActive = activeDocument ? canPreviewDocument(activeDocument) : false;

  return {
    documents,
    isLoading,
    visibleTabs,
    activeDocumentId,
    activeDocument,
    canPreviewActive,
    openTab,
    closeTab,
    setActiveDocument,
  };
};
