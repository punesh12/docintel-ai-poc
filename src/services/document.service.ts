import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { resolveStorageUrl } from "@/services/storage.service";
import type { Document, DocumentStatus } from "@/types";

const MOCK_DOCUMENTS_KEY = "dip_mock_documents";

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
  return Promise.all(documents.map(withResolvedUrl));
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
