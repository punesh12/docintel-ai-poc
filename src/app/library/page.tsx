"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusChip } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useDocuments } from "@/hooks/useDocuments";
import { useOpenDocument } from "@/hooks/useOpenDocument";
import {
  canOpenInLibrary,
  documentStatusChipVariant,
} from "@/utils/document-status";
import { formatFileSize } from "@/utils/format";
import type { Document } from "@/types";

export default function LibraryPage() {
  const { documents, isLoading, removeDocument } = useDocuments();
  const openDocument = useOpenDocument();
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      await removeDocument(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto">
      <PageHeader
        title="Library"
        description="All uploaded documents. Open a file to view it in the tab viewer."
        actions={
          <Link href="/upload">
            <Button>
              <Upload className="h-4 w-4" />
              Upload files
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6">
        {isLoading ? (
          <p className="text-body-md text-on-surface-variant">Loading...</p>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            message="No files yet."
            action={
              <Link href="/upload">
                <Button variant="outline">
                  <Upload className="h-4 w-4" />
                  Upload your first PDF
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface-container-lowest">
            <div className="grid grid-cols-[1fr_100px_120px_160px] gap-4 border-b border-border bg-surface-container-low px-4 py-2.5 text-label-md text-on-surface-variant">
              <span>Name</span>
              <span>Size</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-border">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="grid grid-cols-[1fr_100px_120px_160px] items-center gap-4 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-primary-container" />
                    <span className="truncate text-body-md text-on-surface" title={doc.name}>
                      {doc.name}
                    </span>
                  </div>
                  <span className="text-body-sm tabular-nums text-on-surface-variant">
                    {formatFileSize(doc.size)}
                  </span>
                  <StatusChip
                    className="justify-self-start"
                    variant={documentStatusChipVariant[doc.status] ?? "queued"}
                  >
                    {doc.status}
                  </StatusChip>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canOpenInLibrary(doc)}
                      onClick={() => openDocument(doc.id)}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deletingId === doc.id}
                      onClick={() => setDeleteTarget(doc)}
                      aria-label={`Delete ${doc.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete document?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from your library and storage.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        confirming={deleteTarget !== null && deletingId === deleteTarget.id}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deletingId) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
