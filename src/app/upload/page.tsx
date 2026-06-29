"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, FolderOpen, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { UploadQueue } from "@/components/upload/UploadQueue";
import { UploadToolbar } from "@/components/upload/UploadToolbar";
import { UploadStatsBar } from "@/components/upload/UploadStatsBar";
import { RecentPresets } from "@/components/upload/RecentPresets";
import { Button } from "@/components/ui/button";
import { useUploadQueue } from "@/hooks/useUploadQueue";
import { validatePdfFiles } from "@/utils/pdf-validation";

export default function UploadPage() {
  const {
    items,
    stats,
    searchQuery,
    addFiles,
    cancelUpload,
    pauseAll,
    resumeAll,
    pauseUpload,
    resumeUpload,
    retryUpload,
    removeItem,
    clearCompleted,
    setSearchQuery,
  } = useUploadQueue();

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: File[]) => {
    const { valid, invalid } = validatePdfFiles(files);
    setValidationErrors(invalid.map((i) => `${i.file.name}: ${i.error}`));
    if (valid.length > 0) addFiles(valid);
  };

  const openFilePicker = () => fileInputRef.current?.click();
  const openFolderPicker = () => folderInputRef.current?.click();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Bulk Document Upload"
        description="Upload thousands of documents simultaneously. Our AI engine will begin indexing as soon as the first batch completes. Uploads continue in the background."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={openFolderPicker}>
              <FolderOpen className="h-4 w-4" />
              Upload Folder
            </Button>
            <Button onClick={openFilePicker}>
              <Upload className="h-4 w-4" />
              Upload More Files
            </Button>
            {stats.completed > 0 && (
              <Link href="/library">
                <Button variant="outline">
                  View library
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        }
        footer={
          <button
            type="button"
            className="mt-3 flex items-center gap-1.5 text-body-sm text-primary-container hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Move Uploads to Background
          </button>
        }
      />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />

      <div className="flex min-h-0 flex-1">
        {/* Left: dropzone + presets */}
        <div
          className="shrink-0 space-y-4 border-r border-border p-4"
          style={{ width: "var(--sidebar-width)" }}
        >
          <UploadDropzone onFilesAccepted={handleFiles} compact />

          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-error/20 bg-error-container/40 p-3">
              <p className="text-body-sm font-medium text-on-error-container">
                {validationErrors.length} file(s) rejected
              </p>
              <ul className="mt-1 space-y-0.5 text-body-sm text-on-error-container/80">
                {validationErrors.slice(0, 3).map((err) => (
                  <li key={err} className="truncate">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <RecentPresets />
        </div>

        {/* Center: queue panel */}
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface-container-lowest shadow-sm">
            <UploadStatsBar stats={stats} />
            <UploadToolbar
              searchQuery={searchQuery}
              stats={stats}
              onSearchChange={setSearchQuery}
              onClearCompleted={clearCompleted}
              onPauseAll={pauseAll}
              onResumeAll={resumeAll}
            />
            <div className="min-h-0 flex-1 overflow-auto scrollbar-thin">
              <UploadQueue
                items={items}
                onCancel={cancelUpload}
                onRetry={retryUpload}
                onRemove={removeItem}
                onPause={pauseUpload}
                onResume={resumeUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
