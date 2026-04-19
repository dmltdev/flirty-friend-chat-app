import { type ChatError } from "./types";

export function parseChatError(error: Error): NonNullable<ChatError> {
  try {
    return JSON.parse(error.message) as NonNullable<ChatError>;
  } catch {
    return { type: "unknown", message: error.message };
  }
}
