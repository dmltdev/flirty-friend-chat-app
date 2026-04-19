import { LEET_MAP } from "../constants";

function decompose(text: string): string {
  return text.normalize("NFKD");
}

function stripDiacritics(text: string): string {
  return text.replace(/[\u0300-\u036f]/g, "");
}

function stripZeroWidth(text: string): string {
  return text.replace(/[\u200B-\u200F\u2060\uFEFF\u180E]/g, "");
}

function toLowerCase(text: string): string {
  return text.toLowerCase();
}

function applyLeet(text: string): string {
  let out = "";
  for (const ch of text) {
    out += LEET_MAP[ch] ?? ch;
  }
  return out;
}

function symbolsToSpaces(text: string): string {
  return text.replace(/[^a-z0-9]+/g, " ");
}

function stripNonAlphanumeric(text: string): string {
  return text.replace(/[^a-z0-9]+/g, "");
}

function trimEdges(text: string): string {
  return text.trim();
}

function splitOnWhitespace(text: string): string[] {
  if (!text) return [];
  return text.split(/\s+/);
}

export function collapseRepeats(text: string): string {
  return text.replace(/(.)\1+/g, "$1");
}

function pipe(text: string, steps: Array<(s: string) => string>): string {
  return steps.reduce((acc, step) => step(acc), text);
}

const CHAR_TRANSFORMS: Array<(s: string) => string> = [
  decompose,
  stripDiacritics,
  stripZeroWidth,
  toLowerCase,
  applyLeet,
];

export function tokenize(text: string): string[] {
  const normalized = pipe(text, [...CHAR_TRANSFORMS, symbolsToSpaces, trimEdges]);
  return splitOnWhitespace(normalized).map(collapseRepeats);
}

export function normalizeTarget(word: string): string {
  return pipe(word, [...CHAR_TRANSFORMS, stripNonAlphanumeric, collapseRepeats]);
}
