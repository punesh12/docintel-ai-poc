"use client";

import { memo, useMemo } from "react";
import { buildPdfViewerSrc } from "@/lib/pdf-viewer";

interface PDFViewerInnerProps {
  url: string;
  /** Only the active tab mounts the iframe (keeps one PDF.js instance). */
  isActive: boolean;
}

/**
 * Embeds the official PDF.js viewer (`/pdfjs/web/viewer.html`) for a document.
 * Inactive tabs return null so only one viewer loads at a time.
 */
export const PDFViewerInner = memo(function PDFViewerInner({
  url,
  isActive,
}: PDFViewerInnerProps) {
  const viewerSrc = useMemo(() => {
    if (!url) return "";
    return buildPdfViewerSrc(url, window.location.origin);
  }, [url]);

  if (!isActive) return null;

  return (
    <iframe
      key={viewerSrc}
      src={viewerSrc}
      title="PDF document viewer"
      className="absolute inset-0 h-full w-full border-0 bg-[#525659]"
    />
  );
});
