"use client";

import { memo } from "react";
import { FileText, Pause, Play, RefreshCw, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatusChip } from "@/components/ui/badge";
import type { UploadItem } from "@/types";
import { formatFileSize } from "@/utils/format";
import { cn } from "@/utils/cn";

interface UploadItemRowProps {
  item: UploadItem;
  style?: React.CSSProperties;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

const statusConfig = {
  queued: { label: "Queued", variant: "queued" as const },
  uploading: { label: "Uploading", variant: "uploading" as const },
  completed: { label: "Complete", variant: "ready" as const },
  failed: { label: "Failed", variant: "failed" as const },
  cancelled: { label: "Cancelled", variant: "cancelled" as const },
  paused: { label: "Paused", variant: "paused" as const },
};

const iconColor = {
  queued: "text-gray-400",
  uploading: "text-blue-500",
  completed: "text-emerald-500",
  failed: "text-red-500",
  cancelled: "text-gray-400",
  paused: "text-amber-500",
};

export const GRID_COLS =
  "grid grid-cols-[minmax(240px,1fr)_88px_minmax(130px,1fr)_128px_72px] items-center gap-4";

function getSubtext(item: UploadItem): string | null {
  if (item.status === "uploading") {
    const speed = 2 + (item.id.charCodeAt(0) % 30) / 10;
    return `${speed.toFixed(1)} MB/s`;
  }
  if (item.status === "failed") {
    return item.error ?? "Network Timeout";
  }
  if (item.status === "paused") {
    return "Upload paused";
  }
  return null;
}

export const UploadItemRow = memo(function UploadItemRow({
  item,
  style,
  onCancel,
  onRetry,
  onPause,
  onResume,
}: UploadItemRowProps) {
  const config = statusConfig[item.status];
  const canPause = item.status === "queued" || item.status === "uploading";
  const isPaused = item.isPaused || item.status === "paused";
  const subtext = getSubtext(item);

  const progressColor =
    item.status === "failed"
      ? "bg-error"
      : item.status === "completed"
        ? "bg-primary-container"
        : item.status === "paused"
          ? "bg-amber-400"
          : item.status === "queued"
            ? "bg-surface-container-high"
            : "bg-primary-container";

  const progressValue =
    item.status === "completed"
      ? 100
      : item.status === "queued"
        ? 0
        : item.progress;

  return (
    <div
      style={style}
      className={cn(
        GRID_COLS,
        "border-b border-border px-4 py-3 transition-colors hover:bg-surface-container-low/40"
      )}
    >
      {/* File Name + pause/resume */}
      <div className="flex min-w-0 items-start gap-2">
        <FileText
          className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor[item.status])}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className="min-w-0 truncate text-body-md font-semibold text-on-surface"
              title={item.name}
            >
              {item.name}
            </p>
            {isPaused ? (
              <button
                type="button"
                onClick={() => onResume(item.id)}
                aria-label="Resume upload"
                title="Resume"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              >
                <Play className="h-3 w-3 fill-current" />
              </button>
            ) : canPause ? (
              <button
                type="button"
                onClick={() => onPause(item.id)}
                aria-label="Pause upload"
                title="Pause"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container-low"
              >
                <Pause className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          {subtext && (
            <p
              className={cn(
                "mt-0.5 text-body-sm",
                item.status === "failed"
                  ? "text-error"
                  : item.status === "paused"
                    ? "text-amber-600"
                    : "text-on-surface-variant"
              )}
            >
              {subtext}
            </p>
          )}
        </div>
      </div>

      {/* Size */}
      <span className="text-body-md tabular-nums text-on-surface-variant">
        {formatFileSize(item.size)}
      </span>

      {/* Progress */}
      <div className="min-w-0 pr-2">
        <Progress
          value={progressValue}
          className="h-1"
          indicatorClassName={progressColor}
        />
      </div>

      {/* Status */}
      <StatusChip variant={config.variant}>{config.label}</StatusChip>

      {/* Action */}
      <div className="flex justify-end">
        {item.status === "completed" ? null : item.status === "failed" ? (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            aria-label="Retry upload"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-surface-container-lowest text-blue-600 transition-colors hover:bg-blue-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        ) : canPause && !isPaused ? (
          <button
            type="button"
            onClick={() => onCancel(item.id)}
            aria-label="Cancel upload"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onCancel(item.id)}
            aria-label="Remove"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
