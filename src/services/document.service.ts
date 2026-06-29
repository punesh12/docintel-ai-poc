import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import {
  deletePdfFromStorage,
  listAllStorageObjects,
  resolveStorageUrl,
  storageObjectExists,
  type StorageListedObject,
} from "@/services/storage.service";
import type { Document, DocumentStatus } from "@/types";

const MOCK_DOCUMENTS_KEY = "dip_mock_documents";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getMockDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_DOCUMENTS_KEY);
    return raw ? (JSON.parse(raw) as Document[]) : [];
  } catch {
    return [];
  }
}

function saveMockDocuments(documents: Document[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_DOCUMENTS_KEY, JSON.stringify(documents));
}

async function withResolvedUrl(doc: Document): Promise<Document> {
  if (doc.publicUrl || !doc.storagePath || !isSupabaseConfigured()) {
    return doc;
  }

  try {
    return { ...doc, publicUrl: await resolveStorageUrl(doc.storagePath) };
  } catch {
    return doc;
  }
}

export async function fetchDocuments(): Promise<Document[]> {
  if (!isSupabaseConfigured()) {
    return getMockDocuments();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(error.message);

  const documents = (data ?? []).map(mapDbDocument);

  const verified: Document[] = [];
  const orphanIds: string[] = [];

  for (const doc of documents) {
    if (await storageObjectExists(doc.storagePath)) {
      verified.push(await withResolvedUrl(doc));
    } else {
      orphanIds.push(doc.id);
    }
  }

  if (orphanIds.length > 0) {
    await Promise.all(
      orphanIds.map((id) => deleteDocumentRecord(id).catch(() => undefined))
    );
  }

  const knownPaths = new Set(verified.map((doc) => doc.storagePath));
  const imported: Document[] = [];

  try {
    const storageObjects = await listAllStorageObjects();
    for (const object of storageObjects) {
      if (knownPaths.has(object.path)) continue;

      try {
        const document = await importDocumentFromStorage(object);
        imported.push(document);
        knownPaths.add(object.path);
      } catch {
        // Skip objects that cannot be registered (e.g. duplicate id race).
      }
    }
  } catch {
    // Listing may fail without storage RLS policies — verified DB rows still return.
  }

  const merged = [...imported, ...verified].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return Promise.all(merged.map(withResolvedUrl));
}

/** Client hook entry point — sync runs server-side via `/api/documents`. */
export async function fetchDocumentsFromApi(): Promise<Document[]> {
  const response = await fetch("/api/documents", { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to load documents (${response.status})`);
  }
  return response.json() as Promise<Document[]>;
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus
): Promise<Document> {
  if (!isSupabaseConfigured()) {
    const documents = getMockDocuments();
    const index = documents.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Document not found");

    documents[index] = {
      ...documents[index],
      status,
      processedAt:
        status === "ready" ? new Date().toISOString() : documents[index].processedAt,
    };
    saveMockDocuments(documents);
    return documents[index];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .update({
      status,
      processed_at: status === "ready" ? new Date().toISOString() : undefined,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return withResolvedUrl(mapDbDocument(data));
}

export async function registerDocument(document: Document): Promise<Document> {
  if (!isSupabaseConfigured()) {
    const documents = getMockDocuments();
    documents.unshift(document);
    saveMockDocuments(documents);
    return document;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .upsert({
      id: document.id,
      name: document.name,
      size: document.size,
      storage_path: document.storagePath,
      public_url: document.publicUrl ?? null,
      status: document.status,
      uploaded_at: document.uploadedAt,
      processed_at: document.processedAt ?? null,
      page_count: document.pageCount ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return withResolvedUrl(mapDbDocument(data));
}

async function deleteDocumentRecord(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    saveMockDocuments(getMockDocuments().filter((doc) => doc.id !== id));
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Removes metadata and storage object (ignores missing files in the bucket). */
export async function deleteDocument(document: Document): Promise<void> {
  try {
    await deletePdfFromStorage(document.storagePath);
  } catch {
    // Bucket file may already be deleted manually in Supabase dashboard.
  }

  await deleteDocumentRecord(document.id);
}

function documentIdFromStoragePath(path: string): string {
  const segment = path.split("/")[0] ?? "";
  if (UUID_RE.test(segment)) return segment;
  return crypto.randomUUID();
}

async function importDocumentFromStorage(object: StorageListedObject): Promise<Document> {
  const now = new Date().toISOString();

  return registerDocument({
    id: documentIdFromStoragePath(object.path),
    name: object.name,
    size: object.size,
    storagePath: object.path,
    status: "ready",
    uploadedAt: object.updatedAt || now,
    processedAt: now,
  });
}

function mapDbDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    name: row.name as string,
    size: row.size as number,
    storagePath: (row.storage_path ?? row.storagePath) as string,
    publicUrl: (row.public_url ?? row.publicUrl) as string | undefined,
    status: row.status as Document["status"],
    uploadedAt: (row.uploaded_at ?? row.uploadedAt) as string,
    processedAt: (row.processed_at ?? row.processedAt) as string | undefined,
    pageCount: row.page_count as number | undefined,
  };
}
