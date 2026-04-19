import type {
  WordPairModerationRule,
  WordPairViolation,
} from "./word-pair/types";

export type ModerationRule = WordPairModerationRule;
export type ModerationViolation = WordPairViolation;

export interface ModerationResult {
  ok: boolean;
  violations: ModerationViolation[];
}
