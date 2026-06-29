"use client";

import Link from "next/link";
import { FolderOpen, Sparkles } from "lucide-react";
import { AIChatSheet } from "@/components/workspace/AIChatSheet";
import { DocumentTabs } from "@/components/workspace/DocumentTabs";
import { PDFViewer } from "@/components/workspace/PDFViewer";
import { Button } from "@/components/ui/button";
import { useWorkspaceTabs } from "@/hooks/useWorkspaceTabs";
import { useWorkspaceStore } from "@/store/workspace.store";
import { getPreviewMessage } from "@/utils/document-status";
import { cn } from "@/utils/cn";

export default function WorkspacePage() {
  const {
    documents,
    isLoading,
    visibleTabs,
    activeDocumentId,
    activeDocument,
    canPreviewActive,
    openTab,
    closeTab,
    setActiveDocument,
  } = useWorkspaceTabs();

  const chatSheetOpen = useWorkspaceStore((state) => state.chatSheetOpen);
  const setChatSheetOpen = useWorkspaceStore((state) => state.setChatSheetOpen);

  const showChatFab = canPreviewActive && activeDocument && !chatSheetOpen;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface-container-lowest">
      <DocumentTabs
        documents={documents}
        openedTabs={visibleTabs}
        activeDocumentId={activeDocumentId}
        onSelect={setActiveDocument}
        onClose={closeTab}
        onOpenDocument={openTab}
      />

      {visibleTabs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-body-md text-on-surface-variant">
            {isLoading ? "Loading..." : "No documents open."}
          </p>
          {!isLoading && (
            <Link href="/library">
              <Button variant="outline">
                <FolderOpen className="h-4 w-4" />
                Browse library
              </Button>
            </Link>
          )}
        </div>
      ) : !canPreviewActive ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-body-md text-on-surface-variant">
            {getPreviewMessage(activeDocument)}
          </p>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1">
          {visibleTabs.map((tabId) => {
            const doc = documents.find((document) => document.id === tabId);
            if (!doc?.publicUrl) return null;
            return (
              <PDFViewer
                key={tabId}
                url={doc.publicUrl}
                isActive={tabId === activeDocumentId}
              />
            );
          })}
        </div>
      )}

      {showChatFab && (
        <button
          type="button"
          onClick={() => setChatSheetOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-30 flex h-12 items-center gap-2 rounded-full bg-primary-container px-4 text-on-primary shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          )}
          aria-label="Open AI assistant"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-body-md font-medium">Ask AI</span>
        </button>
      )}

      <AIChatSheet
        open={chatSheetOpen}
        onClose={() => setChatSheetOpen(false)}
        documentId={activeDocumentId}
        documentName={activeDocument?.name}
      />
    </div>
  );
}
