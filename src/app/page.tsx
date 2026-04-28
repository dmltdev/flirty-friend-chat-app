import { readSessionId } from "~/lib/session";

import { ChatClient } from "~/features/chat/components/ChatClient";
import { getInitialMessages } from "~/features/chat";

export default async function ChatPage() {
  const sessionId = await readSessionId();
  const initialMessages = await getInitialMessages(sessionId);
  return <ChatClient initialMessages={initialMessages} />;
}
