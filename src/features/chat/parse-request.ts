import { safeValidateUIMessages } from "ai";
import type { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "~/lib/utils/api";
import type { ChatError, ChatMessage } from "./types";

export async function parseUserMessage(
  req: NextRequest,
): Promise<
  | { ok: true; message: ChatMessage }
  | { ok: false; response: NextResponse }
> {
  const body = await req.json();
  const result = await safeValidateUIMessages({ messages: body?.messages });

  if (!result.success) {
    return {
      ok: false,
      response: createErrorResponse<NonNullable<ChatError>>(
        { type: "bad_request", issues: result.error.message },
        400,
      ),
    };
  }

  const last = result.data.at(-1) as ChatMessage | undefined;
  if (!last || last.role !== "user") {
    return {
      ok: false,
      response: createErrorResponse<NonNullable<ChatError>>(
        { type: "bad_request", message: "last message must be from user" },
        400,
      ),
    };
  }

  return { ok: true, message: last };
}
