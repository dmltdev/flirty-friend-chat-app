export interface WordPairModerationRule {
  kind: "wordPair";
  w1: string;
  w2: string;
  maxDistance: number;
}

export interface WordPairViolation {
  kind: "wordPair";
  rule: WordPairModerationRule;
  w1Index: number;
  w2Index: number;
  distance: number;
}
