"use client";

import { useCallback, useMemo, useRef } from "react";
import { Plus } from "lucide-react";
import type { Document } from "@/types";
import { DocumentPickerMenu } from "@/components/workspace/DocumentPickerMenu";
import { DocumentTab } from "@/components/workspace/DocumentTab";
import { useAnchoredMenu } from "@/hooks/useAnchoredMenu";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getOpenableDocuments } from "@/utils/document-status";
import {
  getTabPaddingClass,
  PICKER_MENU_GAP,
  PICKER_MENU_WIDTH,
} from "@/utils/document-tabs";
import { cn } from "@/utils/cn";

interface DocumentTabsProps {
  documents: Document[];
  openedTabs: string[];
  activeDocumentId: string | null;
  onSelect: (documentId: string) => void;
  onClose: (documentId: string) => void;
  onOpenDocument: (documentId: string) => void;
}

/**
 * Workspace tab bar: open document tabs, empty placeholder, and + picker.
 *
 * Tab widths shrink as more documents are opened. The picker menu is positioned
 * to the left of the + button and dismisses on outside click.
 */
export const DocumentTabs = ({
  documents,
  openedTabs,
  activeDocumentId,
  onSelect,
  onClose,
  onOpenDocument,
}: DocumentTabsProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const pickerMenuRef = useRef<HTMLDivElement>(null);

  const { open: pickerOpen, position, toggle, close } = useAnchoredMenu(pickerButtonRef, {
    menuWidth: PICKER_MENU_WIDTH,
    gap: PICKER_MENU_GAP,
    placement: "left",
  });

  const clickOutsideTargets = useMemo(
    () => [pickerRef, pickerMenuRef],
    [pickerRef, pickerMenuRef]
  );

  useClickOutside(pickerOpen, clickOutsideTargets, close);

  const docMap = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents]
  );

  const { openable: openableDocs, pending: pendingDocs } = useMemo(
    () => getOpenableDocuments(documents, openedTabs),
    [documents, openedTabs]
  );

  const handleOpenDocument = useCallback(
    (documentId: string) => {
      onOpenDocument(documentId);
      close();
    },
    [close, onOpenDocument]
  );

  const hasOpenTabs = openedTabs.length > 0;
  const tabCount = openedTabs.length;
  const compactTabs = tabCount > 3;
  const tabPadding = getTabPaddingClass(tabCount);

  return (
    <div className="relative z-20 shrink-0 border-b border-border bg-[#eef0f4] px-3 pt-2">
      <div
        className={cn(
          "flex min-w-0 items-end overflow-x-auto scrollbar-thin",
          hasOpenTabs ? "w-full" : "inline-flex max-w-full"
        )}
      >
        {!hasOpenTabs && (
          <div className="flex shrink-0 items-center px-4 py-2.5 text-body-md text-on-surface-variant">
            No document open
          </div>
        )}

        {openedTabs.map((tabId) => {
          const document = docMap.get(tabId);
          if (!document) return null;

          return (
            <DocumentTab
              key={tabId}
              document={document}
              isActive={tabId === activeDocumentId}
              tabCount={tabCount}
              compactTabs={compactTabs}
              tabPadding={tabPadding}
              onSelect={() => onSelect(tabId)}
              onClose={() => onClose(tabId)}
            />
          );
        })}

        <div className="relative shrink-0" ref={pickerRef}>
          <button
            ref={pickerButtonRef}
            type="button"
            onClick={toggle}
            aria-expanded={pickerOpen}
            aria-haspopup="menu"
            className={cn(
              "flex h-[42px] w-10 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-container/30",
              pickerOpen
                ? "bg-surface-container-lowest text-primary-container"
                : "text-[#6b7280] hover:bg-surface-container-lowest/60 hover:text-on-surface"
            )}
            aria-label="Open document"
            title="Open document"
          >
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {pickerOpen && position && (
        <DocumentPickerMenu
          menuRef={pickerMenuRef}
          position={position}
          documents={documents}
          openableDocs={openableDocs}
          pendingDocs={pendingDocs}
          onOpenDocument={handleOpenDocument}
          onClose={close}
        />
      )}
    </div>
  );
};
