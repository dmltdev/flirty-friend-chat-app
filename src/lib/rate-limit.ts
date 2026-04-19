const BUCKETS = new Map<string, { tokens: number; lastRefill: number }>();
const CAPACITY = 10;
const REFILL_PER_SEC = 10 / 60;

export type RateLimitResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      retryAfterSec: number;
    };

export function checkRateLimit(sessionId: string): RateLimitResult {
  const now = Date.now();
  const bucket = BUCKETS.get(sessionId) ?? {
    tokens: CAPACITY,
    lastRefill: now,
  };
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + elapsed * REFILL_PER_SEC);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    BUCKETS.set(sessionId, bucket);
    return { ok: true };
  }

  BUCKETS.set(sessionId, bucket);
  const retryAfterSec = Math.ceil((1 - bucket.tokens) / REFILL_PER_SEC);
  return { ok: false, retryAfterSec };
}
