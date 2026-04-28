import type { ChatMessage } from "./types";

/**
 * Idempotent append of a user message to server history, keyed by id.
 *
 * - New id: append.
 * - Existing id (regenerate/retry): replace it in place and drop everything
 *   after — i.e. the stale assistant turn from the previous attempt.
 */
export function mergeUserMessage(
  serverHistory: ChatMessage[],
  userMessage: ChatMessage,
): ChatMessage[] {
  const existingIdx = serverHistory.findIndex((m) => m.id === userMessage.id);
  return existingIdx >= 0
    ? [...serverHistory.slice(0, existingIdx), userMessage]
    : [...serverHistory, userMessage];
}
