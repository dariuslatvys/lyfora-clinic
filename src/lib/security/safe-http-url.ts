/** Allow only http(s) URLs suitable for visit join links. Prefer https. */
export function sanitizeHttpsUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }
  // Block credentials in URL and obvious non-network schemes already filtered.
  if (parsed.username || parsed.password) return null;
  return parsed.toString();
}
