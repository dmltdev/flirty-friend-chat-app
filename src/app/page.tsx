import { getSessionId } from "../lib/session";

import { getHistory } from "~/features/chat/store";
import { ChatClient } from "~/features/chat/components/ChatClient";

export default async function ChatPage() {
  const sessionId = await getSessionId();
  const initialMessages = await getHistory(sessionId);
  return <ChatClient initialMessages={initialMessages} />;
}
