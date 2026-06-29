import { NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PROCESSING_DELAY_MS = 400;

function isEdgeFunctionUnavailable(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("not found") ||
    lower.includes("404") ||
    lower.includes("failed to send") ||
    lower.includes("functionsrelayerror") ||
    lower.includes("non-2xx")
  );
}

/**
 * Server-side proxy for the optional `process-document` edge function.
 * Defaults to a local no-op stub when the edge function is not deployed.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "mock" });
  }

  let documentId: string | undefined;
  try {
    const body = (await request.json()) as { documentId?: string };
    documentId = body.documentId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!documentId) {
    return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
  }

  const useEdgeFunction = process.env.ENABLE_SUPABASE_PROCESS_DOCUMENT === "true";

  if (!useEdgeFunction) {
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
    return NextResponse.json({ ok: true, mode: "local", documentId });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke("process-document", {
    body: { documentId },
  });

  if (error) {
    const message = error.message ?? "Edge function failed";

    if (isEdgeFunctionUnavailable(message)) {
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
      return NextResponse.json({ ok: true, mode: "local", documentId, skipped: true });
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, mode: "edge", documentId });
}
