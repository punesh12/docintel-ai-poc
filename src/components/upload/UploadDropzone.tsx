"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/utils/cn";
import { validatePdfFiles } from "@/utils/pdf-validation";

interface UploadDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function UploadDropzone({
  onFilesAccepted,
  disabled,
  compact,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const { valid } = validatePdfFiles(acceptedFiles);
      if (valid.length > 0) onFilesAccepted(valid);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    disabled,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        compact ? "min-h-[200px] p-6" : "min-h-[240px] p-8",
        isDragActive && !isDragReject && "border-primary-container bg-primary-fixed/30",
        isDragReject && "border-error bg-error-container/30",
        !isDragActive &&
        "border-outline-variant bg-surface-container-lowest hover:border-primary-container/50 hover:bg-primary-fixed/10",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container">
        <UploadCloud className="h-6 w-6 text-primary-container" />
      </div>
      <p className="text-headline-md text-on-surface">
        {isDragActive ? "Drop files here" : "Drop Files Here"}
      </p>
      <p className="mt-2 text-center text-body-sm text-on-surface-variant">
        Support for PDF, DOCX, and XLSX
        <br />
        (Max 100MB per file)
      </p>
    </div>
  );
}
