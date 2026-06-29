import { create } from "zustand";
import { uploadManager, createUploadItemId } from "@/lib/upload-manager";
import type { UploadFilter, UploadItem, UploadProgressEvent } from "@/types";
import { UPLOAD_CONCURRENCY } from "@/utils/constants";

interface UploadState {
  items: Map<string, UploadItem>;
  searchQuery: string;
  filter: UploadFilter;
  concurrency: number;
  isInitialized: boolean;

  initialize: () => void;
  addFiles: (files: File[]) => string[];
  cancelUpload: (itemId: string) => void;
  cancelAll: () => void;
  pauseAll: () => void;
  resumeAll: () => void;
  pauseUpload: (itemId: string) => void;
  resumeUpload: (itemId: string) => void;
  retryUpload: (itemId: string) => void;
  retryAllFailed: () => void;
  removeItem: (itemId: string) => void;
  clearCompleted: () => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: UploadFilter) => void;
  setConcurrency: (concurrency: number) => void;

  getFilteredItems: () => UploadItem[];
  getOverallProgress: () => number;
  getStats: () => {
    total: number;
    queued: number;
    uploading: number;
    completed: number;
    failed: number;
  };
}

function applyProgressEvent(
  items: Map<string, UploadItem>,
  event: UploadProgressEvent
): Map<string, UploadItem> {
  const item = items.get(event.itemId);
  if (!item) return items;

  const next = new Map(items);
  next.set(event.itemId, {
    ...item,
    status: item.isPaused ? "paused" : event.status,
    progress: item.isPaused ? item.progress : event.progress,
    error: item.isPaused ? item.error : event.error,
    documentId: event.documentId ?? item.documentId,
    retryCount:
      event.error?.startsWith("Retrying") ? item.retryCount + 1 : item.retryCount,
  });
  return next;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  items: new Map(),
  searchQuery: "",
  filter: "all",
  concurrency: UPLOAD_CONCURRENCY,
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;

    uploadManager.configure({ maxConcurrency: get().concurrency });
    uploadManager.subscribe((event) => {
      set((state) => ({ items: applyProgressEvent(state.items, event) }));
    });

    set({ isInitialized: true });
  },

  addFiles: (files) => {
    const ids: string[] = [];
    const newItems = new Map(get().items);

    const batch = files.map((file) => {
      const id = createUploadItemId();
      ids.push(id);
      newItems.set(id, {
        id,
        file,
        name: file.name,
        size: file.size,
        status: "queued",
        progress: 0,
        retryCount: 0,
        addedAt: Date.now(),
      });
      return { itemId: id, file };
    });

    set({ items: newItems });
    uploadManager.enqueueBatch(batch);
    return ids;
  },

  cancelUpload: (itemId) => {
    uploadManager.cancel(itemId);
  },

  cancelAll: () => {
    uploadManager.cancelAll();
  },

  pauseAll: () => {
    uploadManager.pauseAll();
    for (const item of get().items.values()) {
      if (
        (item.status === "queued" || item.status === "uploading") &&
        !item.isPaused
      ) {
        get().pauseUpload(item.id);
      }
    }
  },

  resumeAll: () => {
    uploadManager.resumeAll();
    for (const item of get().items.values()) {
      if (item.isPaused) {
        get().resumeUpload(item.id);
      }
    }
  },

  pauseUpload: (itemId) => {
    const item = get().items.get(itemId);
    if (!item || item.isPaused) return;
    if (item.status !== "queued" && item.status !== "uploading") return;

    uploadManager.pauseItem(itemId, item.file, item.retryCount, item.progress);

    set((state) => {
      const next = new Map(state.items);
      next.set(itemId, {
        ...item,
        status: "paused",
        isPaused: true,
      });
      return { items: next };
    });
  },

  resumeUpload: (itemId) => {
    const item = get().items.get(itemId);
    if (!item?.isPaused) return;

    set((state) => {
      const next = new Map(state.items);
      next.set(itemId, {
        ...item,
        status: "queued",
        isPaused: false,
      });
      return { items: next };
    });

    uploadManager.resumeItem(itemId);
  },

  retryUpload: (itemId) => {
    const item = get().items.get(itemId);
    if (!item) return;

    set((state) => {
      const next = new Map(state.items);
      next.set(itemId, {
        ...item,
        status: "queued",
        progress: 0,
        error: undefined,
        isPaused: false,
      });
      return { items: next };
    });

    uploadManager.retry(itemId, item.file, item.retryCount);
  },

  retryAllFailed: () => {
    const failed = [...get().items.values()].filter((i) => i.status === "failed");
    for (const item of failed) {
      get().retryUpload(item.id);
    }
  },

  removeItem: (itemId) => {
    set((state) => {
      const next = new Map(state.items);
      next.delete(itemId);
      return { items: next };
    });
  },

  clearCompleted: () => {
    set((state) => {
      const next = new Map(state.items);
      for (const [id, item] of next) {
        if (item.status === "completed" || item.status === "cancelled") {
          next.delete(id);
        }
      }
      return { items: next };
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilter: (filter) => set({ filter }),

  setConcurrency: (concurrency) => {
    set({ concurrency });
    uploadManager.configure({ maxConcurrency: concurrency });
  },

  getFilteredItems: () => {
    const { items, searchQuery, filter } = get();
    let result = [...items.values()];

    if (filter !== "all") {
      result = result.filter((item) => item.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    return result.sort((a, b) => b.addedAt - a.addedAt);
  },

  getOverallProgress: () => {
    const all = [...get().items.values()];
    if (all.length === 0) return 0;
    const total = all.reduce((sum, item) => sum + item.progress, 0);
    return total / all.length;
  },

  getStats: () => {
    const all = [...get().items.values()];
    return {
      total: all.length,
      queued: all.filter((i) => i.status === "queued" || i.status === "paused").length,
      uploading: all.filter((i) => i.status === "uploading").length,
      completed: all.filter((i) => i.status === "completed").length,
      failed: all.filter((i) => i.status === "failed").length,
    };
  },
}));
