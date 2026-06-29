"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadStore } from "@/store/upload.store";
import type { UploadFilter, UploadItem } from "@/types";

function filterItems(
  items: Map<string, UploadItem>,
  searchQuery: string,
  filter: UploadFilter
): UploadItem[] {
  let result = [...items.values()];

  if (filter !== "all") {
    result = result.filter((item) => item.status === filter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter((item) => item.name.toLowerCase().includes(q));
  }

  return result.sort((a, b) => b.addedAt - a.addedAt);
}

function computeStats(items: Map<string, UploadItem>) {
  const all = [...items.values()];
  return {
    total: all.length,
    queued: all.filter((i) => i.status === "queued" || i.status === "paused").length,
    uploading: all.filter((i) => i.status === "uploading").length,
    completed: all.filter((i) => i.status === "completed").length,
    failed: all.filter((i) => i.status === "failed").length,
  };
}

function computeOverallProgress(items: Map<string, UploadItem>): number {
  const all = [...items.values()];
  if (all.length === 0) return 0;
  return all.reduce((sum, item) => sum + item.progress, 0) / all.length;
}

export function useUploadQueue() {
  const queryClient = useQueryClient();
  const initialize = useUploadStore((s) => s.initialize);
  const itemsMap = useUploadStore((s) => s.items);
  const searchQuery = useUploadStore((s) => s.searchQuery);
  const filter = useUploadStore((s) => s.filter);
  const concurrency = useUploadStore((s) => s.concurrency);

  const addFiles = useUploadStore((s) => s.addFiles);
  const cancelUpload = useUploadStore((s) => s.cancelUpload);
  const cancelAll = useUploadStore((s) => s.cancelAll);
  const pauseAll = useUploadStore((s) => s.pauseAll);
  const resumeAll = useUploadStore((s) => s.resumeAll);
  const pauseUpload = useUploadStore((s) => s.pauseUpload);
  const resumeUpload = useUploadStore((s) => s.resumeUpload);
  const retryUpload = useUploadStore((s) => s.retryUpload);
  const retryAllFailed = useUploadStore((s) => s.retryAllFailed);
  const removeItem = useUploadStore((s) => s.removeItem);
  const clearCompleted = useUploadStore((s) => s.clearCompleted);
  const setSearchQuery = useUploadStore((s) => s.setSearchQuery);
  const setFilter = useUploadStore((s) => s.setFilter);
  const setConcurrency = useUploadStore((s) => s.setConcurrency);

  const items = useMemo(
    () => filterItems(itemsMap, searchQuery, filter),
    [itemsMap, searchQuery, filter]
  );

  const stats = useMemo(() => computeStats(itemsMap), [itemsMap]);
  const overallProgress = useMemo(
    () => computeOverallProgress(itemsMap),
    [itemsMap]
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const hasCompleted = [...itemsMap.values()].some(
      (i) => i.status === "completed"
    );
    if (hasCompleted) {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  }, [itemsMap, queryClient]);

  return {
    items,
    stats,
    overallProgress,
    searchQuery,
    filter,
    concurrency,
    addFiles,
    cancelUpload,
    cancelAll,
    pauseAll,
    resumeAll,
    pauseUpload,
    resumeUpload,
    retryUpload,
    retryAllFailed,
    removeItem,
    clearCompleted,
    setSearchQuery,
    setFilter,
    setConcurrency,
  };
}
