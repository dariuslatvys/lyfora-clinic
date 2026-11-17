type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Simple in-memory throttle (per instance). */
export function checkRequestRateLimit(opts: {
  key: string;
  windowMs: number;
  max: number;
}): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const bucket = buckets.get(opts.key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }
  if (bucket.count >= opts.max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { ok: true };
}
