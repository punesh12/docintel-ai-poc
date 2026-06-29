/**
 * Document eligibility rules shared across library, workspace, and tab picker.
 *
 * Keeps open/preview logic consistent so UI states do not drift between pages.
 */

import type { Document } from "@/types";

/** Library "Open" button — document must be fully ready with a public URL. */
export const canOpenInLibrary = (document: Document) =>
  document.status === "ready" && Boolean(document.publicUrl);

/** PDF viewer — requires a resolvable `publicUrl` (any status). */
export const canPreviewDocument = (document: Document) => Boolean(document.publicUrl);

/** Tab picker — includes processing docs that already have a URL. */
export const isOpenableInPicker = (document: Document) =>
  (document.status === "ready" || document.status === "processing") &&
  Boolean(document.publicUrl);

/** Tab picker — still processing and not yet viewable. */
export const isPendingDocument = (document: Document) =>
  document.status === "processing" && !document.publicUrl;

/**
 * Splits closed documents into openable and pending lists for the tab picker.
 *
 * @param documents - Full document list.
 * @param openedTabIds - IDs already open as tabs (excluded from results).
 */
export const getOpenableDocuments = (
  documents: Document[],
  openedTabIds: string[]
) => {
  const opened = new Set(openedTabIds);
  const closed = documents.filter((document) => !opened.has(document.id));

  return {
    openable: closed.filter(isOpenableInPicker),
    pending: closed.filter(isPendingDocument),
  };
};

/** User-facing message when the active tab cannot show a PDF preview. */
export const getPreviewMessage = (document: Document | null) => {
  if (!document) return "This document cannot be previewed yet.";
  if (document.status === "processing") return "Document is still processing...";
  return "This document cannot be previewed yet.";
};

/** Maps `DocumentStatus` to `StatusChip` variant keys. */
export const documentStatusChipVariant = {
  ready: "ready" as const,
  processing: "processing" as const,
  uploading: "uploading" as const,
  failed: "failed" as const,
};
