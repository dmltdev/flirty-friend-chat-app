import type { ModerationResult, ModerationRule, ModerationViolation } from "./types";
import { detectWordPairViolations } from "./word-pair/detect";
import { tokenize } from "./word-pair/normalize";

export function moderateText(
  text: string,
  rules: ModerationRule[],
): ModerationResult {
  const tokens = tokenize(text);
  const violations: ModerationViolation[] = [];

  for (const rule of rules) {
    switch (rule.kind) {
      case "wordPair":
        violations.push(...detectWordPairViolations(tokens, rule));
        break;
      default: {
        const _exhaustive: never = rule.kind;
        throw new Error(`Unknown moderation rule kind: ${String(_exhaustive)}`);
      }
    }
  }

  return { ok: violations.length === 0, violations };
}
