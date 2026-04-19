import type { ModerationResult } from "~/features/moderation/types";
import { type ChatMessage, isFlagged } from "./types";

export function tagWithModeration(
  message: ChatMessage,
  result: ModerationResult,
): ChatMessage {
  return {
    ...message,
    metadata: {
      ...(message.metadata ?? {}),
      moderation: result.ok
        ? { flagged: false }
        : { flagged: true, violations: result.violations },
    },
  };
}

export function stripFlagged(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((m) => !isFlagged(m));
}

export function preserveModerationTags(
  target: ChatMessage[],
  source: ChatMessage[],
): ChatMessage[] {
  const tagsById = new Map(
    source
      .filter((m) => m.metadata?.moderation)
      .map((m) => [m.id, m.metadata!.moderation!] as const),
  );
  return target.map((m) => {
    const tag = tagsById.get(m.id);
    return tag
      ? { ...m, metadata: { ...(m.metadata ?? {}), moderation: tag } }
      : m;
  });
}
