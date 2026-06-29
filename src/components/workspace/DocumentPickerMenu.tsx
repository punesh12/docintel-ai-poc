import Link from "next/link";
import { FileText, Upload } from "lucide-react";
import type { Document } from "@/types";
import type { MenuPosition } from "@/hooks/useAnchoredMenu";

interface DocumentPickerMenuProps {
  menuRef: React.RefObject<HTMLDivElement | null>;
  position: MenuPosition;
  documents: Document[];
  /** Closed documents that can be opened immediately. */
  openableDocs: Document[];
  /** Closed documents still processing (shown disabled). */
  pendingDocs: Document[];
  onOpenDocument: (documentId: string) => void;
  onClose: () => void;
}

/**
 * Fixed-position dropdown from the + button in the workspace tab bar.
 * Lists openable documents plus links to library and upload.
 */
export const DocumentPickerMenu = ({
  menuRef,
  position,
  documents,
  openableDocs,
  pendingDocs,
  onOpenDocument,
  onClose,
}: DocumentPickerMenuProps) => (
  <div
    ref={menuRef}
    role="menu"
    className="fixed z-50 w-72 overflow-hidden rounded-lg border border-border bg-surface-container-lowest shadow-[var(--shadow-popover)]"
    style={{ top: position.top, left: position.left }}
    onMouseDown={(event) => event.stopPropagation()}
  >
    <p className="border-b border-border px-3 py-2 text-label-md text-on-surface-variant">
      Open Document
    </p>

    {openableDocs.length > 0 && (
      <ul className="max-h-48 overflow-auto py-1">
        {openableDocs.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              role="menuitem"
              onClick={() => onOpenDocument(doc.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-on-surface hover:bg-surface-container-low"
            >
              <FileText className="h-4 w-4 shrink-0 text-primary-container" />
              <span className="truncate">{doc.name}</span>
            </button>
          </li>
        ))}
      </ul>
    )}

    {pendingDocs.length > 0 && (
      <ul className="border-t border-border py-1">
        {pendingDocs.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center gap-2 px-3 py-2 text-body-sm text-on-surface-variant opacity-60"
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{doc.name}</span>
            <span className="ml-auto text-xs">Processing…</span>
          </li>
        ))}
      </ul>
    )}

    {openableDocs.length === 0 && pendingDocs.length === 0 && (
      <p className="px-3 py-3 text-body-sm text-on-surface-variant">
        {documents.length === 0
          ? "No documents yet."
          : "All documents are already open."}
      </p>
    )}

    <div className="border-t border-border p-1">
      <Link
        href="/library"
        role="menuitem"
        onClick={onClose}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-body-sm text-on-surface hover:bg-surface-container-low"
      >
        <FileText className="h-4 w-4 shrink-0" />
        Browse library
      </Link>
      <Link
        href="/upload"
        role="menuitem"
        onClick={onClose}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-body-sm font-medium text-primary-container hover:bg-primary-fixed/40"
      >
        <Upload className="h-4 w-4 shrink-0" />
        Upload files
      </Link>
    </div>
  </div>
);
