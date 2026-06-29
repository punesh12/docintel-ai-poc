import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ChatRequestBody {
  documentId?: string;
  documentName?: string;
  message?: string;
}

/**
 * POC mock AI endpoint — replace with a real LLM + RAG pipeline in production.
 */
export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const documentName = body.documentName ?? "this document";

  const reply =
    `Here's a POC analysis of **${documentName}** in response to: "${message}"\n\n` +
    "• The document appears to be a PDF stored in your library.\n" +
    "• In production, this would use document embeddings and page-level citations.\n" +
    "• Connect an LLM provider and indexing pipeline to enable real answers.";

  return NextResponse.json({ reply });
}
