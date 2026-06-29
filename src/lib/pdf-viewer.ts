/**
 * Builds the PDF.js viewer iframe `src` URL.
 *
 * External URLs (e.g. Supabase) are proxied same-origin via `/api/pdf` because
 * `viewer.mjs` blocks cross-origin `file=` URLs. The `file=` param must be an
 * absolute URL — relative paths break PDF.js URL parsing.
 *
 * @param pdfUrl - Remote or same-origin PDF URL.
 * @param origin - App origin (e.g. `window.location.origin`).
 */
export const buildPdfViewerSrc = (pdfUrl: string, origin: string): string => {
  const isAbsoluteHttp = /^https?:\/\//i.test(pdfUrl);

  const fileTarget = isAbsoluteHttp
    ? `${origin}/api/pdf?url=${encodeURIComponent(pdfUrl)}`
    : pdfUrl.startsWith("/")
      ? `${origin}${pdfUrl}`
      : `${origin}/${pdfUrl}`;

  return `/pdfjs/web/viewer.html?file=${encodeURIComponent(fileTarget)}`;
};
