export type DocumentStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed";

export interface Document {
  id: string;
  name: string;
  size: number;
  storagePath: string;
  publicUrl?: string;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  pageCount?: number;
}
