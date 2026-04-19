"use client";

import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

import { parseChatError } from "~/features/chat/parse-error";
import type { ChatError } from "~/features/chat/types";

import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatErrorBanner } from "./ChatErrorBanner";
import { ChatInput, type ChatInputHandle } from "./ChatInput";

interface ChatClientProps {
  initialMessages: UIMessage[];
}

export function ChatClient({ initialMessages }: ChatClientProps) {
  const [chatError, setChatError] = useState<ChatError>(null);
  const inputRef = useRef<ChatInputHandle>(null);
  const lastSubmittedRef = useRef<string>("");

  const { messages, sendMessage, status, stop, regenerate } = useChat({
    messages: initialMessages,
    onError: (error) => {
      setChatError(parseChatError(error));
      inputRef.current?.focus();
    },
  });

  const handleSubmit = (text: string) => {
    setChatError(null);
    lastSubmittedRef.current = text;
    sendMessage({ text });
  };

  const handleRetry = () => {
    setChatError(null);
    regenerate();
  };

  const handleEdit = () => {
    setChatError(null);
    inputRef.current?.setValue(lastSubmittedRef.current);
    inputRef.current?.focus();
  };

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-full">
      <ChatHeader isLoading={isLoading} />
      <MessageList
        messages={messages}
        isSubmitted={status === "submitted"}
        isStreaming={status === "streaming"}
      />
      {chatError && (
        <ChatErrorBanner
          error={chatError}
          onRetry={handleRetry}
          onEdit={handleEdit}
        />
      )}
      <ChatInput
        ref={inputRef}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onStop={stop}
        onDirty={() => chatError && setChatError(null)}
      />
    </div>
  );
}
