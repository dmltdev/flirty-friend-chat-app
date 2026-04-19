# "Flirty Friend" chat app - streaming + moderation

Timebox: 60-90 minutes.
Actual time spent: 88 minutes. Started at 20:46 (local time), finished at 22:14.

## How to run

- Install dependencies: `pnpm i` or `npm i`.
- Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
- Run the dev server: `pnpm dev` or `npm run dev`.
- Open `localhost:3000` and chat away.

Chat history is stored with `lowdb` at `data/sessions/{sessionId}.json`. To start fresh, clear or delete that file.

## Architecture notes and choice justifications

### Why I built what I built

Moderation was the highest-priority requirement, so it got the biggest time window - reading the algorithm, writing tests, handling obfuscation cases. Rate limiting, sessions, streaming, and a working chat UI were the other hard requirements, so those went in next.

Everything below is polish, robustness, or scale - valuable, but not achievable at an MVP level within 90 minutes.

### Stack: full-stack Next.js (App Router)

One process, one deploy, shared types. The task is small enough that splitting into a separate Nest backend would just add boilerplate and require me to set up a monorepo or two directories with separate dependencies and project setups. A single route handler under `src/app/api/chat` covers all I need.

### Transport: HTTP with streaming (Vercel AI SDK)

SSE/WS would work too but the AI SDK's `toUIMessageStreamResponse` + `useChat` already handle token streaming, backpressure, and reconnect. The stream only goes one way, so a WebSocket would be excessive.

### Moderation

Blocking and pre-LLM. Public API is `moderateText(text, rules)` returning `{ ok, violations[] }`. Rules are a discriminated union so new kinds can slot in later - today only `wordPair` exists.

Pipeline in `src/features/moderation/`:

1. **Normalize** (`word-pair/normalize.ts`) - NFKD decompose -> strip diacritics -> strip zero-width chars -> lowercase -> leet map (`0->o`, `@->a`, `$->s`, `1/!->l`, etc.) -> replace symbols with spaces -> tokenize on whitespace -> collapse repeated letters per token (`haaack -> hak`).
2. **Detect** (`word-pair/detect.ts`) - for each rule word, find token ranges that match the normalized target. Supports multi-token matches (`h a c k` -> one range) by concatenating adjacent tokens and re-collapsing. Distance is token gap between non-overlapping ranges. Overlapping ranges are skipped. Violations are deduped by range pair and sorted by earliest index.
3. **Dispatch** (`moderate.ts`) - top-level `switch` on `rule.kind` with a `never` branch to force exhaustiveness when new kinds are added.

Whole-word match is guaranteed because detection works on tokens, not substrings - `drugstore` tokenizes to `drugstore`, which won't equal `drugs`.

### Rate limiting

Token bucket per session, 10 req/min, in-memory (`src/lib/rate-limit.ts`). Send endpoint returns `429` with `Retry-After` header and a machine-readable `{ type: "rate_limited", retryAfterSec }` body. In-memory is per-process, so prod would need Redis to share state across instances if you run more than one.

### Sessions & persistence

Anonymous session ID in an HTTP-only cookie. History stored server-side with `lowdb` (flat JSON file per session). Server history is the source of truth - moderation flags on past messages live there, not in the client payload, so a user can't clear a flag by editing what they re-send.

History is capped at the last 100 messages per session (`MAX_MESSAGES_PER_SESSION`) - older ones are dropped on write. Input is capped at 1000 chars (`MAX_INPUT_CHARS`) as a small abuse guard.

## AI Usage Notes

Within a very limited timebox, I scoped AI to one feature at a time and iterated. Ran 2 Claude Code sessions in parallel, reading their output diagonally to check they stayed on track while I handled session and rate limiter myself.

Most time went into moderation - reading the generated code, making sure it was maintainable and actually passed the obfuscation cases. AI wrote ~90% of it.

Exported chats are in `chats/` - the longest one is `chats/moderation.txt`.

In a real project, I'd write a spec first, plan the implementation, dispatch subagents, review each step against the requirements, and save recurring mistakes to `AGENTS.MD` as rules for future AI sessions to be more efficient.

## Feature Suggestions

What I'd do with more time, roughly high to low priority:
- Moderate assistant output too - clean input doesn't guarantee a clean reply (user asks "rhymes with rugs?" → reply contains "drugs" near "buy").
- Improve the persona prompt and write evals for LLM attack vectors - does it stay in character or not.
- Structured logs + LLM call metrics (tokens, latency, cost per session) and error tracking (Sentry).
- Better error UX: global `error.tsx`, clearer messages, ensured coverage for all network errors. Would add component tests.
- Smarter auto-scroll when streaming - don't block the user if they scroll up, show a "jump to latest" arrow.
- Better chat UX: "Retry" button next to each user message, timestamps, an alert when the LLM response is slow.
- Sidebar to switch between chats, rename, delete.
- Markdown support in the textarea (or Tiptap/Slate).
- Virtualized list for long chats.
