import type { ModerationRule } from "./types";

export const MODERATED_WORD_PAIRS: ModerationRule[] = [
  { kind: "wordPair", w1: "buy", w2: "drugs", maxDistance: 3 },
  { kind: "wordPair", w1: "sell", w2: "drugs", maxDistance: 3 },
  { kind: "wordPair", w1: "hack", w2: "system", maxDistance: 5 },
];

export const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "l",
  "!": "l",
  $: "s",
  "3": "e",
  "4": "a",
  "@": "a",
  "5": "s",
  "7": "t",
  "+": "t",
  "8": "b",
};
