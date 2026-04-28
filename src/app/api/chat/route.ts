import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import {
  getHistory,
  mergeUserMessage,
  parseUserMessage,
  preserveModerationTags,
  replaceHistory,
  streamChatResponse,
  stripFlagged,
  tagWithModeration,
} from "~/features/chat";
import type { ChatError } from "~/features/chat/types";
import { getMessageText } from "~/features/chat/text";
import { MAX_INPUT_CHARS } from "~/features/chat/constants";
import { MODERATED_WORD_PAIRS, moderateText } from "~/features/moderation";
import { checkRateLimit } from "~/lib/rate-limit";
import { getSessionId } from "~/lib/session";
import { createErrorResponse } from "~/lib/utils/api";
import { acquireSessionLock } from "~/lib/session-lock";

export async function GET() {
  const sessionId = await getSessionId();
  return NextResponse.json({ messages: await getHistory(sessionId) });
}

export async function POST(req: NextRequest) {
  const sessionId = await getSessionId();

  const rl = checkRateLimit(sessionId);
  if (!rl.ok) {
    return createErrorResponse<NonNullable<ChatError>>(
      { type: "rate_limited", retryAfterSec: rl.retryAfterSec },
      429,
      { "Retry-After": String(rl.retryAfterSec) },
    );
  }

  const parsed = await parseUserMessage(req);
  if (!parsed.ok) return parsed.response;

  const userText = getMessageText(parsed.message);
  if (userText.length > MAX_INPUT_CHARS) {
    return createErrorResponse<NonNullable<ChatError>>(
      {
        type: "bad_request",
        message: `Message is too long (${userText.length} / ${MAX_INPUT_CHARS} chars).`,
      },
      400,
    );
  }

  const release = await acquireSessionLock(sessionId);
  try {
    // Server-stored history is the source of truth — moderation flags on prior
    // messages live here, not in the client-submitted payload.
    const serverHistory = await getHistory(sessionId);
    const moderation = moderateText(userText, MODERATED_WORD_PAIRS);
    const taggedUser = tagWithModeration(parsed.message, moderation);
    const persistedHistory = mergeUserMessage(serverHistory, taggedUser);
    await replaceHistory(sessionId, persistedHistory);

    if (!moderation.ok) {
      release();
      return createErrorResponse<NonNullable<ChatError>>(
        { type: "moderation_blocked", violations: moderation.violations },
        400,
      );
    }

    const stream = await streamChatResponse(stripFlagged(persistedHistory));
    return stream.toUIMessageStreamResponse({
      originalMessages: persistedHistory,
      onFinish: async ({ messages: finalMessages }) => {
        try {
          await replaceHistory(
            sessionId,
            preserveModerationTags(finalMessages, persistedHistory),
          );
        } finally {
          release();
        }
      },
      onError: (err) => {
        release();
        return err instanceof Error ? err.message : String(err);
      },
    });
  } catch (err) {
    release();
    throw err;
  }
}
