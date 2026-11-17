import { checkRequestRateLimit } from "@/lib/auth/request-rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

/**
 * Prefer the rightmost X-Forwarded-For hop (usually set by the edge/proxy).
 * The leftmost value is client-supplied and must not be trusted alone.
 */
export function platformClientIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && !realIp.includes(",")) return realIp;

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) return parts[parts.length - 1]!;
  }

  return "unknown";
}

/** Login throttle keyed by platform IP and optional email. */
export function checkLoginRateLimit(
  req: Request,
  email?: string
): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const ip = platformClientIp(req);
  const normalizedEmail = (email || "").trim().toLowerCase();
  const key = `login:${ip}:${normalizedEmail || "_"}`;
  return checkRequestRateLimit({
    key,
    windowMs: WINDOW_MS,
    max: MAX_ATTEMPTS,
  });
}
