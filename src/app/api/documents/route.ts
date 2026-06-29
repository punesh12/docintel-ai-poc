import { NextResponse } from "next/server";
import { fetchDocuments } from "@/services/document.service";

export const dynamic = "force-dynamic";

/**
 * Returns library documents after reconciling Postgres metadata with storage.
 * Orphaned rows (file deleted from bucket) are removed before responding.
 */
export async function GET() {
  try {
    const documents = await fetchDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
