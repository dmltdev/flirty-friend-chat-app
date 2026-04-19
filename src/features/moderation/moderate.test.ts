import { describe, expect, it } from "vitest";
import { MODERATED_WORD_PAIRS } from "./constants";
import { moderateText } from "./moderate";

describe("moderateText", () => {
  it("returns ok=true with empty violations for clean text", () => {
    const result = moderateText("hello world", MODERATED_WORD_PAIRS);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("returns ok=false with violations when a word-pair rule triggers", () => {
    const result = moderateText("buy drugs", MODERATED_WORD_PAIRS);
    expect(result.ok).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].kind).toBe("wordPair");
  });

  it("returns ok=true when no rules are passed", () => {
    const result = moderateText("buy drugs", []);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("aggregates violations from multiple rules", () => {
    const result = moderateText("hack the system to buy drugs", MODERATED_WORD_PAIRS);
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule.w1).sort()).toEqual(["buy", "hack"]);
  });
});
