import { v4 as uuidv4 } from "uuid";
import {
  uploadPdfToStorage,
} from "@/services/storage.service";
import { registerDocument } from "@/services/document.service";
import type { UploadProgressEvent, UploadManagerConfig } from "@/types";
import { UPLOAD_CONCURRENCY, UPLOAD_MAX_RETRIES } from "@/utils/constants";

type ProgressListener = (event: UploadProgressEvent) => void;

interface QueuedTask {
  itemId: string;
  file: File;
  retryCount: number;
  savedProgress?: number;
}

/**
 * UploadManager lives outside React to avoid re-renders during high-frequency
 * progress updates and to keep upload scheduling deterministic.
 */
class UploadManager {
  private config: UploadManagerConfig = {
    maxConcurrency: UPLOAD_CONCURRENCY,
    maxRetries: UPLOAD_MAX_RETRIES,
  };

  private queue: QueuedTask[] = [];
  private activeWorkers = 0;
  private abortControllers = new Map<string, AbortController>();
  private listeners = new Set<ProgressListener>();
  private cancelledIds = new Set<string>();
  private pausedItemIds = new Set<string>();
  private pausedTasks = new Map<string, QueuedTask>();
  private paused = false;

  configure(config: Partial<UploadManagerConfig>): void {
    this.config = { ...this.config, ...config };
    this.processQueue();
  }

  subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  enqueue(itemId: string, file: File): void {
    this.queue.push({ itemId, file, retryCount: 0 });
    this.emit({ itemId, progress: 0, status: "queued" });
    this.processQueue();
  }

  enqueueBatch(items: Array<{ itemId: string; file: File }>): void {
    for (const item of items) {
      this.queue.push({ itemId: item.itemId, file: item.file, retryCount: 0 });
      this.emit({ itemId: item.itemId, progress: 0, status: "queued" });
    }
    this.processQueue();
  }

  cancel(itemId: string): void {
    this.cancelledIds.add(itemId);
    this.pausedItemIds.delete(itemId);
    this.pausedTasks.delete(itemId);
    this.abortControllers.get(itemId)?.abort();
    this.queue = this.queue.filter((task) => task.itemId !== itemId);
    this.emit({ itemId, progress: 0, status: "cancelled" });
  }

  cancelAll(): void {
    for (const itemId of this.abortControllers.keys()) {
      this.cancel(itemId);
    }
    this.queue = [];
  }

  retry(itemId: string, file: File, retryCount: number): void {
    this.cancelledIds.delete(itemId);
    this.queue.unshift({ itemId, file, retryCount });
    this.emit({ itemId, progress: 0, status: "queued" });
    this.processQueue();
  }

  retryFailed(items: Array<{ itemId: string; file: File; retryCount: number }>): void {
    for (const item of items) {
      this.retry(item.itemId, item.file, item.retryCount);
    }
  }

  pauseAll(): void {
    this.paused = true;
  }

  resumeAll(): void {
    this.paused = false;
    this.processQueue();
  }

  pauseItem(
    itemId: string,
    file: File,
    retryCount: number,
    progress = 0
  ): void {
    this.pausedItemIds.add(itemId);
    this.pausedTasks.set(itemId, { itemId, file, retryCount, savedProgress: progress });
    this.abortControllers.get(itemId)?.abort();
    this.queue = this.queue.filter((task) => task.itemId !== itemId);
  }

  resumeItem(itemId: string): void {
    const task = this.pausedTasks.get(itemId);
    if (!task) return;

    this.pausedItemIds.delete(itemId);
    this.pausedTasks.delete(itemId);
    this.queue.push(task);
    this.emit({
      itemId,
      progress: task.savedProgress ?? 0,
      status: "queued",
    });
    this.processQueue();
  }

  isItemPaused(itemId: string): boolean {
    return this.pausedItemIds.has(itemId);
  }

  isPaused(): boolean {
    return this.paused;
  }

  private processQueue(): void {
    if (this.paused) return;
    while (
      this.activeWorkers < this.config.maxConcurrency &&
      this.queue.length > 0
    ) {
      const task = this.queue.shift();
      if (!task || this.cancelledIds.has(task.itemId)) continue;
      if (this.pausedItemIds.has(task.itemId)) continue;
      this.startUpload(task);
    }
  }

  private async startUpload(task: QueuedTask): Promise<void> {
    const { itemId, file, retryCount } = task;
    const controller = new AbortController();
    this.abortControllers.set(itemId, controller);
    this.activeWorkers++;

    this.emit({
      itemId,
      progress: task.savedProgress ?? 0,
      status: "uploading",
    });

    try {
      const result = await uploadPdfToStorage(file, {
        signal: controller.signal,
        onProgress: (progress) => {
          const task = this.pausedTasks.get(itemId);
          if (task) task.savedProgress = progress;
          this.emit({ itemId, progress, status: "uploading" });
        },
      });

      if (this.cancelledIds.has(itemId) || this.pausedItemIds.has(itemId)) return;

      const now = new Date().toISOString();

      await registerDocument({
        id: result.documentId,
        name: file.name,
        size: file.size,
        storagePath: result.storagePath,
        publicUrl: result.publicUrl,
        status: "ready",
        uploadedAt: now,
        processedAt: now,
      });

      this.emit({
        itemId,
        progress: 100,
        status: "completed",
        documentId: result.documentId,
      });
    } catch (error) {
      if (this.pausedItemIds.has(itemId)) return;

      if (controller.signal.aborted || this.cancelledIds.has(itemId)) {
        this.emit({ itemId, progress: 0, status: "cancelled" });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Upload failed";

      if (retryCount < this.config.maxRetries) {
        this.queue.push({ itemId, file, retryCount: retryCount + 1 });
        this.emit({
          itemId,
          progress: 0,
          status: "queued",
          error: `Retrying (${retryCount + 1}/${this.config.maxRetries}): ${message}`,
        });
      } else {
        this.emit({
          itemId,
          progress: 0,
          status: "failed",
          error: message,
        });
      }
    } finally {
      this.abortControllers.delete(itemId);
      this.activeWorkers--;
      this.processQueue();
    }
  }

  private emit(event: UploadProgressEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const uploadManager = new UploadManager();

export function createUploadItemId(): string {
  return uuidv4();
}
