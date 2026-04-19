import type { WordPairModerationRule, WordPairViolation } from "./types";
import { collapseRepeats, normalizeTarget } from "./normalize";

interface TokenRange {
  start: number;
  end: number;
}

function findWordRanges(tokens: string[], target: string): TokenRange[] {
  const ranges: TokenRange[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let acc = "";
    for (let j = i; j < tokens.length; j++) {
      acc += tokens[j];
      const collapsed = collapseRepeats(acc);
      if (collapsed.length > target.length) break;
      if (collapsed === target) {
        ranges.push({ start: i, end: j });
        break;
      }
    }
  }
  return ranges;
}

function computeDistance(a: TokenRange, b: TokenRange): number | null {
  if (a.end < b.start) return b.start - a.end - 1;
  if (b.end < a.start) return a.start - b.end - 1;
  return null;
}

export function detectWordPairViolations(
  tokens: string[],
  rule: WordPairModerationRule,
): WordPairViolation[] {
  if (tokens.length === 0) return [];

  const target1 = normalizeTarget(rule.w1);
  const target2 = normalizeTarget(rule.w2);
  if (!target1 || !target2) return [];

  const ranges1 = findWordRanges(tokens, target1);
  const ranges2 = findWordRanges(tokens, target2);

  const violations: WordPairViolation[] = [];
  const seen = new Set<string>();

  for (const r1 of ranges1) {
    for (const r2 of ranges2) {
      const distance = computeDistance(r1, r2);
      if (distance === null) continue;
      if (distance > rule.maxDistance) continue;

      const key = `${r1.start}-${r1.end}|${r2.start}-${r2.end}`;
      if (seen.has(key)) continue;
      seen.add(key);

      violations.push({
        kind: "wordPair",
        rule,
        w1Index: r1.start,
        w2Index: r2.start,
        distance,
      });
    }
  }

  violations.sort((a, b) => {
    const aMin = Math.min(a.w1Index, a.w2Index);
    const bMin = Math.min(b.w1Index, b.w2Index);
    return aMin - bMin;
  });

  return violations;
}
