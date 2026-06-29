"use client";

import { memo, useMemo } from "react";
import { List, type RowComponentProps } from "react-window";
import { UploadItemRow, GRID_COLS } from "@/components/upload/UploadItem";
import type { UploadItem } from "@/types";
import { UPLOAD_LIST_ITEM_HEIGHT } from "@/utils/constants";

interface UploadQueueProps {
  items: UploadItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

interface RowProps {
  items: UploadItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

const MAX_LIST_HEIGHT = 560;

function UploadRow({
  index,
  style,
  items,
  onCancel,
  onRetry,
  onRemove,
  onPause,
  onResume,
}: RowComponentProps<RowProps>) {
  const item = items[index];
  if (!item) return null;

  return (
    <UploadItemRow
      item={item}
      style={style}
      onCancel={onCancel}
      onRetry={onRetry}
      onRemove={onRemove}
      onPause={onPause}
      onResume={onResume}
    />
  );
}

export const UploadQueue = memo(function UploadQueue({
  items,
  onCancel,
  onRetry,
  onRemove,
  onPause,
  onResume,
}: UploadQueueProps) {
  const listHeight = useMemo(
    () => Math.min(items.length * UPLOAD_LIST_ITEM_HEIGHT, MAX_LIST_HEIGHT),
    [items.length]
  );

  const rowProps = useMemo<RowProps>(
    () => ({ items, onCancel, onRetry, onRemove, onPause, onResume }),
    [items, onCancel, onRetry, onRemove, onPause, onResume]
  );

  if (items.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-body-md text-on-surface-variant">
        <p>No files in queue.</p>
        <p className="mt-1 text-body-sm">Drop files in the zone to begin uploading.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`${GRID_COLS} border-b border-border bg-surface-container-low px-4 py-2.5`}
      >
        <span className="text-label-md text-on-surface-variant">File Name</span>
        <span className="text-label-md text-on-surface-variant">Size</span>
        <span className="text-label-md text-on-surface-variant">Progress</span>
        <span className="text-label-md text-on-surface-variant">Status</span>
        <span className="text-right text-label-md text-on-surface-variant">
          Action
        </span>
      </div>
      <List
        rowCount={items.length}
        rowHeight={UPLOAD_LIST_ITEM_HEIGHT}
        rowComponent={UploadRow}
        rowProps={rowProps}
        style={{ height: listHeight, width: "100%" }}
      />
    </div>
  );
});
