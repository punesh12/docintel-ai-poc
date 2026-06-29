"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

interface PDFViewerProps {
  url: string;
  isActive: boolean;
}

const PDFViewerInner = dynamic(
  () =>
    import("@/components/workspace/PDFViewerInner").then((mod) => mod.PDFViewerInner),
  {
    ssr: false,
    loading: () => <Skeleton className="absolute inset-0 bg-[#525659]" />,
  }
);

/**
 * Client-only PDF viewer wrapper. Dynamically imports PDF.js iframe to avoid SSR.
 */
export const PDFViewer = ({ url, isActive }: PDFViewerProps) => (
  <PDFViewerInner url={url} isActive={isActive} />
);
