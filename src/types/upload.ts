export type UploadStatus =
  | "queued"
  | "uploading"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused";

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  error?: string;
  documentId?: string;
  retryCount: number;
  addedAt: number;
  isPaused?: boolean;
}

export interface UploadProgressEvent {
  itemId: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  documentId?: string;
}

export interface UploadManagerConfig {
  maxConcurrency: number;
  maxRetries: number;
}

export type UploadFilter = "all" | "queued" | "uploading" | "completed" | "failed";
