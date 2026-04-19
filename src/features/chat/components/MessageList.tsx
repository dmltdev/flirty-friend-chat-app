import { useEffect, useRef } from "react";
import type { UIMessage } from "@ai-sdk/react";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: UIMessage[];
  isSubmitted: boolean;
  isStreaming: boolean;
}

export function MessageList({
  messages,
  isSubmitted,
  isStreaming,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
    });
  }, [messages]);

  const lastIdx = messages.length - 1;

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-atomic="false"
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
    >
      {messages.map((message, i) => (
        <MessageItem
          key={message.id}
          message={message}
          isStreaming={
            isStreaming && i === lastIdx && message.role === "assistant"
          }
        />
      ))}
      {isSubmitted && (
        <div className="flex justify-start">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-2 text-sm text-zinc-400">
            <span className="animate-pulse">...</span>
          </div>
        </div>
      )}
    </div>
  );
}
