import { NextResponse } from "next/server";
import { getSupabaseUrl } from "@/lib/supabase";

/**
 * Same-origin PDF proxy for the workspace viewer.
 *
 * PDF.js rejects cross-origin `file=` URLs. This route fetches allowed Supabase
 * storage URLs server-side and streams the bytes back to the browser.
 *
 * @query url - Encoded Supabase public storage URL.
 */
export async function GET(request: Request) {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const urlParam = new URL(request.url).searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const allowedHost = new URL(supabaseUrl).host;
  const isSupabaseStorage =
    target.host === allowedHost && target.pathname.includes("/storage/v1/object/");

  if (!isSupabaseStorage) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  const upstream = await fetch(target.href, { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Failed to fetch PDF (${upstream.status})` },
      { status: upstream.status }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
