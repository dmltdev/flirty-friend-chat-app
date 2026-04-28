import { NextResponse } from "next/server";

export function createErrorResponse<T>(
  error: T,
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json<T>(error, { status, headers });
}
