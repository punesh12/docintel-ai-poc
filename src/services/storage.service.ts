import { v4 as uuidv4 } from "uuid";
import {
  getSupabaseClient,
  getSupabaseAnonKey,
  getSupabaseUrl,
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

export async function triggerAIProcessing(documentId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke("process-document", {
    body: { documentId },
  });

  if (error) {
    // Edge function optional — mark ready when processing isn't deployed
    console.warn("process-document function unavailable:", error.message);
  }
}
