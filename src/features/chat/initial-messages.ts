import { getHistory } from "./store";
import { getIntroMessage } from "./persona";
import type { ChatMessage } from "./types";

export async function getInitialMessages(
  sessionId: string | null,
): Promise<ChatMessage[]> {
  if (!sessionId) return [getIntroMessage("pending")];
  return getHistory(sessionId);
}
