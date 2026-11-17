/** MIME types safe to render inline in the browser on this origin. */
const INLINE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

const BLOCKED_INLINE = new Set([
  "image/svg+xml",
  "image/svg",
  "text/html",
  "application/xhtml+xml",
  "text/xml",
  "application/xml",
]);

export function normalizeMimeType(raw: string | null | undefined): string {
  return (raw || "").split(";")[0]?.trim().toLowerCase() || "";
}

/** True when the type must never be served inline (scriptable documents). */
export function isBlockedInlineMime(mime: string): boolean {
  const t = normalizeMimeType(mime);
  if (!t) return false;
  if (BLOCKED_INLINE.has(t)) return true;
  if (t.includes("svg")) return true;
  return false;
}

export function downloadContentHeaders(opts: {
  mimeType: string | null | undefined;
  originalName: string;
}): { contentType: string; disposition: "inline" | "attachment" } {
  const raw = normalizeMimeType(opts.mimeType);
  if (isBlockedInlineMime(raw) || !INLINE_TYPES.has(raw)) {
    return {
      contentType: "application/octet-stream",
      disposition: "attachment",
    };
  }
  return { contentType: raw, disposition: "inline" };
}

export function isLikelySvgUpload(opts: {
  mimeType: string | null | undefined;
  originalName: string;
}): boolean {
  const mime = normalizeMimeType(opts.mimeType);
  if (isBlockedInlineMime(mime)) return true;
  const name = opts.originalName.toLowerCase();
  return name.endsWith(".svg") || name.endsWith(".svgz");
}
