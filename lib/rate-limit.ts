import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so the map does not grow unbounded.
setInterval(() => {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt < now) buckets.delete(key);
  });
}, 60_000).unref?.();

export function clientKey(request: NextRequest, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${scope}:${ip}`;
}

/**
 * Simple in-memory fixed-window rate limiter.
 * Returns true when the request is allowed, false when the limit is exceeded.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Reset all buckets (used by tests). */
export function resetRateLimits(): void {
  buckets.clear();
}
