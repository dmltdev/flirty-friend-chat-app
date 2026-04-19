import { NextResponse, type NextRequest } from "next/server";
import { ensureSessionCookie } from "./lib/session";

export function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  ensureSessionCookie(req, res);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
