"use client";

import { useUploadStore } from "@/store/upload.store";
import { useDocuments } from "@/hooks/useDocuments";

export function StatusFooter() {
  const items = useUploadStore((s) => s.items);
  const { documents } = useDocuments();

  const uploading = [...items.values()].filter((i) => i.status === "uploading").length;
  const ready = documents.filter((d) => d.status === "ready").length;

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-surface-container-low px-4 text-body-sm text-on-surface-variant">
      <span>{ready} file{ready !== 1 ? "s" : ""} in library</span>
      <span>
        {uploading > 0 ? `${uploading} uploading` : "Ready"}
      </span>
    </footer>
  );
}
