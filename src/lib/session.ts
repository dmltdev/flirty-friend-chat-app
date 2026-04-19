import { cookies } from "next/headers";
import { type NextRequest, type NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const SESSION_COOKIE = "sid";
const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

export function ensureSessionCookie(req: NextRequest, res: NextResponse): void {
  if (req.cookies.get(SESSION_COOKIE)) return;
  const sid = randomUUID();
  req.cookies.set(SESSION_COOKIE, sid);
  res.cookies.set(SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SEC,
  });
}

export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) throw new Error("Session cookie missing");
  return sid;
}
