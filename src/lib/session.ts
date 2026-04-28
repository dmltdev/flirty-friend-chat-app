import { cookies } from "next/headers";
import { type NextRequest, type NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const SESSION_COOKIE = "sid";
const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ONE_YEAR_SEC,
} as const;

/** Middleware: stamp the cookie on the response so subsequent requests carry it. */
export function ensureSessionCookie(req: NextRequest, res: NextResponse): void {
  if (req.cookies.get(SESSION_COOKIE)) return;

  const sid = randomUUID();

  req.cookies.set(SESSION_COOKIE, sid);
  res.cookies.set(SESSION_COOKIE, sid, COOKIE_OPTIONS);
}

/** Read-only. Safe in RSC. Returns null when middleware hasn't run. */
export async function readSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Read or lazily create. Requires a writable cookie context — Route Handlers
 * and Server Actions only. Calling this from a Server Component will throw.
 */
export async function ensureSessionId(): Promise<string> {
  const jar = await cookies();

  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sid = randomUUID();
  jar.set(SESSION_COOKIE, sid, COOKIE_OPTIONS);
  return sid;
}
