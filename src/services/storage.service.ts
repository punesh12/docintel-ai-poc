import { v4 as uuidv4 } from "uuid";
import {
  getSupabaseClient,
  getServerStorageClient,
  getSupabaseUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
  STORAGE_BUCKET,
} from "@/lib/supabase";

export interface UploadResult {
  documentId: string;
  storagePath: string;
  publicUrl: string;
}

export interface StorageUploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

function createMockUploadResult(file: File): UploadResult {
  const documentId = uuidv4();
  const storagePath = `uploads/${documentId}/${file.name}`;
  return {
    documentId,
    storagePath,
    publicUrl: URL.createObjectURL(file),
  };
}

export function getStoragePublicUrl(storagePath: string): string {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getStorageSignedUrl(
  storagePath: string,
  expiresInSeconds = 60 * 60
): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed URL");
  }

  return data.signedUrl;
}

export async function resolveStorageUrl(storagePath: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC !== "false") {
    return getStoragePublicUrl(storagePath);
  }
  return getStorageSignedUrl(storagePath);
}

async function uploadWithProgress(
  file: File,
  storagePath: string,
  options: StorageUploadOptions
): Promise<void> {
  const { onProgress, signal } = options;
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase is not configured");
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const handleAbort = () => {
      xhr.abort();
      reject(new DOMException("Upload aborted", "AbortError"));
    };

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener("abort", handleAbort, { once: true });

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.((event.loaded / event.total) * 100);
      }
    });

    xhr.addEventListener("load", () => {
      signal?.removeEventListener("abort", handleAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      let message = `Upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } catch {
        if (xhr.responseText) message = xhr.responseText;
      }
      reject(new Error(message));
    });

    xhr.addEventListener("error", () => {
      signal?.removeEventListener("abort", handleAbort);
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      signal?.removeEventListener("abort", handleAbort);
      reject(new DOMException("Upload aborted", "AbortError"));
    });

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", file.type || "application/pdf");
    xhr.send(file);
  });
}

export async function uploadPdfToStorage(
  file: File,
  options: StorageUploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, signal } = options;

  if (!isSupabaseConfigured()) {
    return simulateUpload(file, onProgress, signal);
  }

  const documentId = uuidv4();
  const storagePath = `${documentId}/${file.name}`;

  signal?.throwIfAborted();
  await uploadWithProgress(file, storagePath, { onProgress, signal });

  const publicUrl = await resolveStorageUrl(storagePath);

  return {
    documentId,
    storagePath,
    publicUrl,
  };
}

async function simulateUpload(
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<UploadResult> {
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    signal?.throwIfAborted();
    await new Promise((resolve) => setTimeout(resolve, 50));
    onProgress?.((i / steps) * 100);
  }
  return createMockUploadResult(file);
}

export async function deletePdfFromStorage(storagePath: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
  if (error) throw new Error(error.message);
}

export interface StorageListedObject {
  path: string;
  name: string;
  size: number;
  updatedAt: string;
}

function isStorageFile(item: { id: string | null }): boolean {
  return Boolean(item.id);
}

function getStorageListingClient() {
  return typeof window === "undefined" ? getServerStorageClient() : getSupabaseClient();
}

/** Lists every file in the storage bucket with basic metadata. */
export async function listAllStorageObjects(): Promise<StorageListedObject[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getStorageListingClient();
  const objects: StorageListedObject[] = [];

  async function walk(prefix: string): Promise<void> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(prefix, { limit: 1000 });

    if (error) {
      throw new Error(error.message);
    }

    for (const item of data ?? []) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (isStorageFile(item)) {
        const metadata = item.metadata as { size?: number } | null;
        objects.push({
          path: itemPath,
          name: item.name,
          size: metadata?.size ?? 0,
          updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
        });
        continue;
      }

      if (item.name) {
        await walk(itemPath);
      }
    }
  }

  await walk("");
  return objects;
}

/** @deprecated Prefer `listAllStorageObjects` when metadata is needed. */
export async function listAllStorageObjectPaths(): Promise<Set<string>> {
  const objects = await listAllStorageObjects();
  return new Set(objects.map((object) => object.path));
}

/** Returns false when the PDF was removed from the bucket but DB metadata remains. */
export async function storageObjectExists(storagePath: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  const slash = storagePath.lastIndexOf("/");
  const folder = slash >= 0 ? storagePath.slice(0, slash) : "";
  const fileName = slash >= 0 ? storagePath.slice(slash + 1) : storagePath;

  const supabase = getStorageListingClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folder, { search: fileName, limit: 100 });

  if (!error && (data ?? []).some((item) => Boolean(item.id) && item.name === fileName)) {
    return true;
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC !== "false") {
    try {
      const url = getStoragePublicUrl(storagePath);
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      return response.ok;
    } catch {
      return false;
    }
  }

  return false;
}

export async function triggerAIProcessing(documentId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

  const response = await fetch("/api/process-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Processing failed (${response.status})`);
  }
}
