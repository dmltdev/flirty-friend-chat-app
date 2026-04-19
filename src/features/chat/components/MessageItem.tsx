import { type UIMessage } from "ai";
import { memo } from "react";
import { cn } from "~/lib/utils";

interface MessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}

function getMessageText(m: UIMessage): string {
  return m.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export const MessageItem = memo(function MessageItem({
  message,
  isStreaming = false,
}: MessageItemProps) {
  const text = getMessageText(message);
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[min(80%,320px)] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
          message.role === "user"
            ? "bg-pink-500 text-white rounded-br-md"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-md",
        )}
      >
        {text}
        {isStreaming && (
          <span
            aria-hidden
            className="inline-block w-1.5 h-4 bg-current align-middle ml-0.5 animate-pulse"
          />
        )}
      </div>
    </div>
  );
});
