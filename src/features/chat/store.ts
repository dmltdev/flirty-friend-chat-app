import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { MAX_MESSAGES_PER_SESSION } from "./constants";
import { getIntroMessage } from "./persona";
import { type ChatMessage } from "./types";

type SessionData = { messages: ChatMessage[] };

const DATA_DIR = path.join(process.cwd(), "data", "sessions");

function ensureId(message: ChatMessage): ChatMessage {
  return message.id ? message : { ...message, id: randomUUID() };
}

function sessionFilePath(sessionId: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(sessionId)) {
    throw new Error("Invalid session id");
  }
  return path.join(DATA_DIR, `${sessionId}.json`);
}

async function openDb(sessionId: string): Promise<Low<SessionData>> {
  await mkdir(DATA_DIR, { recursive: true });
  const adapter = new JSONFile<SessionData>(sessionFilePath(sessionId));
  const intro = getIntroMessage(sessionId);
  const db = new Low<SessionData>(adapter, { messages: [intro] });
  await db.read();
  if (!db.data || !Array.isArray(db.data.messages)) {
    db.data = { messages: [intro] };
    await db.write();
  }
  return db;
}

export async function getHistory(sessionId: string): Promise<ChatMessage[]> {
  const db = await openDb(sessionId);
  return db.data.messages;
}

export async function appendMessage(
  sessionId: string,
  message: ChatMessage,
): Promise<void> {
  const db = await openDb(sessionId);
  db.data.messages.push(ensureId(message));
  if (db.data.messages.length > MAX_MESSAGES_PER_SESSION) {
    db.data.messages.splice(
      0,
      db.data.messages.length - MAX_MESSAGES_PER_SESSION,
    );
  }
  await db.write();
}

export async function replaceHistory(
  sessionId: string,
  messages: ChatMessage[],
): Promise<void> {
  const db = await openDb(sessionId);
  db.data.messages = messages.slice(-MAX_MESSAGES_PER_SESSION).map(ensureId);
  await db.write();
}
