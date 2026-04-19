import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

// Capacity = 10, refill = 10 tokens / 60s => 1 token per 6s.
// BUCKETS is module-level, so each test uses a unique sessionId.

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  it("allows the first request for a new session", () => {
    expect(checkRateLimit("new-session")).toEqual({ ok: true });
  });

  it("allows a burst up to capacity (10 requests)", () => {
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit("burst").ok).toBe(true);
    }
  });

  it("rejects the 11th request in a burst and reports retryAfterSec", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("over");
    const result = checkRateLimit("over");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("isolates buckets by sessionId", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("alice");
    expect(checkRateLimit("alice").ok).toBe(false);
    expect(checkRateLimit("bob").ok).toBe(true);
  });

  it("refills a token after ~6 seconds of idle", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("refill-one");
    expect(checkRateLimit("refill-one").ok).toBe(false);

    vi.advanceTimersByTime(6_000);

    expect(checkRateLimit("refill-one").ok).toBe(true);
    expect(checkRateLimit("refill-one").ok).toBe(false);
  });

  it("does not refill a full token before the interval elapses", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("partial");
    vi.advanceTimersByTime(3_000);
    expect(checkRateLimit("partial").ok).toBe(false);
  });

  it("refills up to full capacity after 60 seconds of idle", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("refill-full");
    vi.advanceTimersByTime(60_000);

    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit("refill-full").ok).toBe(true);
    }
    expect(checkRateLimit("refill-full").ok).toBe(false);
  });

  it("caps tokens at CAPACITY even after long idle periods", () => {
    checkRateLimit("idle");
    vi.advanceTimersByTime(10 * 60_000);

    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit("idle").ok).toBe(true);
    }
    expect(checkRateLimit("idle").ok).toBe(false);
  });

  it("sustains a steady rate at the refill cadence", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("steady");

    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(6_000);
      expect(checkRateLimit("steady").ok).toBe(true);
    }
  });
});
