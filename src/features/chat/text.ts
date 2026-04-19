import type { ChatMessage } from "./types";

export function getMessageText(message: ChatMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ");
}
