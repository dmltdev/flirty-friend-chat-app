import { safeValidateUIMessages } from "ai";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import {
  getHistory,
  preserveModerationTags,
  replaceHistory,
  streamChatResponse,
  stripFlagged,
  tagWithModeration,
} from "~/features/chat";
import type { ChatError, ChatMessage } from "~/features/chat/types";
import { getMessageText } from "~/features/chat/text";
import { MODERATED_WORD_PAIRS, moderateText } from "~/features/moderation";
import { checkRateLimit } from "~/lib/rate-limit";
import { getSessionId } from "~/lib/session";

function errorResponse(
  error: NonNullable<ChatError>,
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json<NonNullable<ChatError>>(error, { status, headers });
}

async function parseUserMessage(
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
      response: errorResponse(
        { type: "bad_request", issues: result.error.message },
        400,
      ),
    };
  }

  const last = result.data.at(-1) as ChatMessage | undefined;
  if (!last || last.role !== "user") {
    return {
      ok: false,
      response: errorResponse(
        { type: "bad_request", message: "last message must be from user" },
        400,
      ),
    };
  }

  return { ok: true, message: last };
}

export async function GET() {
  const sessionId = await getSessionId();
  return NextResponse.json({ messages: await getHistory(sessionId) });
}

export async function POST(req: NextRequest) {
  const sessionId = await getSessionId();

  const rl = checkRateLimit(sessionId);
  if (!rl.ok) {
    return errorResponse(
      { type: "rate_limited", retryAfterSec: rl.retryAfterSec },
      429,
      { "Retry-After": String(rl.retryAfterSec) },
    );
  }

  const parsed = await parseUserMessage(req);
  if (!parsed.ok) return parsed.response;

  // Server-stored history is the source of truth — moderation flags on prior
  // messages live here, not in the client-submitted payload.
  const serverHistory = await getHistory(sessionId);
  const moderation = moderateText(
    getMessageText(parsed.message),
    MODERATED_WORD_PAIRS,
  );
  const taggedUser = tagWithModeration(parsed.message, moderation);
  const persistedHistory = [...serverHistory, taggedUser];
  await replaceHistory(sessionId, persistedHistory);

  if (!moderation.ok) {
    return errorResponse(
      { type: "moderation_blocked", violations: moderation.violations },
      400,
    );
  }

  const stream = await streamChatResponse(stripFlagged(persistedHistory));
  return stream.toUIMessageStreamResponse({
    originalMessages: persistedHistory,
    onFinish: async ({ messages: finalMessages }) => {
      await replaceHistory(
        sessionId,
        preserveModerationTags(
          finalMessages as ChatMessage[],
          persistedHistory,
        ),
      );
    },
  });
}
