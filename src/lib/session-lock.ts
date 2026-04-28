const locks = new Map<string, Promise<unknown>>();

const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * Per-session async mutex. Returns a release function the caller MUST invoke
 * exactly once on every code path (success, error, early return).
 *
 * A watchdog auto-releases after `timeoutMs` to prevent a leaked stream from
 * permanently freezing a session. The watchdog firing is a bug signal — log
 * loudly so it's discoverable.
 */
export async function acquireSessionLock(
  sessionId: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<() => void> {
  const prev = locks.get(sessionId) ?? Promise.resolve();

  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });

  const next = prev.then(() => gate);
  locks.set(sessionId, next);

  await prev;

  let released = false;
  const safeRelease = () => {
    if (released) return;
    released = true;
    clearTimeout(watchdog);
    release();
    if (locks.get(sessionId) === next) locks.delete(sessionId);
  };

  const watchdog = setTimeout(() => {
    console.warn(
      `[session-lock] watchdog fired for ${sessionId} after ${timeoutMs}ms - onFinish likely never ran`,
    );
    safeRelease();
  }, timeoutMs);

  return safeRelease;
}
