import type { UIMessage } from "ai";
import type { ModerationViolation } from "~/features/moderation/types";

export type MessageModerationFlag = {
  flagged: boolean;
  violations?: ModerationViolation[];
};

export type ChatMessageMetadata = {
  moderation?: MessageModerationFlag;
};

export type ChatMessage = UIMessage<ChatMessageMetadata>;

export function isFlagged(message: ChatMessage): boolean {
  return message.metadata?.moderation?.flagged === true;
}

export type ChatSession = {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
};

export type ChatError =
  | { type: "moderation_blocked"; violations: ModerationViolation[] }
  | { type: "rate_limited"; retryAfterSec: number }
  | { type: "bad_request"; message?: string; issues?: string }
  | { type: "unknown"; message?: string }
  | null;
