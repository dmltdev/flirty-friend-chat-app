import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { PERSONA_SYSTEM_PROMPT } from "./persona";
import { type ChatMessage } from "./types";

export async function streamChatResponse(messages: ChatMessage[]) {
  return streamText({
    model: openai("gpt-4o-mini"),
    system: PERSONA_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });
}
