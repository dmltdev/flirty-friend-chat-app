import { describe, expect, it } from "vitest";
import { MODERATED_WORD_PAIRS } from "../constants";
import { moderateText } from "../moderate";

const detectWordPairViolations = (
  text: string,
  rules: typeof MODERATED_WORD_PAIRS,
) => moderateText(text, rules).violations;

describe("detectWordPairViolations", () => {
  it("returns empty array for clean text", () => {
    expect(
      detectWordPairViolations("hello how are you", MODERATED_WORD_PAIRS),
    ).toEqual([]);
  });

  it("detects adjacent pair with distance 0", () => {
    const v = detectWordPairViolations("buy drugs", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ distance: 0, w1Index: 0, w2Index: 1 });
  });

  it("counts words BETWEEN for distance", () => {
    const v = detectWordPairViolations(
      "hack the main payment system",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toHaveLength(1);
    expect(v[0].distance).toBe(3);
  });

  it("respects maxDistance", () => {
    const v = detectWordPairViolations(
      "buy w x y z more drugs",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toEqual([]);
  });

  it("is order-independent", () => {
    const v = detectWordPairViolations("drugs to buy", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ w1Index: 2, w2Index: 0, distance: 1 });
  });

  it("is case-insensitive", () => {
    const v = detectWordPairViolations("BUY DRUGS", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
  });

  it("handles leet substitutions ($e11 drug$)", () => {
    const v = detectWordPairViolations("$e11 drug$", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
    expect(v[0].rule.w1).toBe("sell");
  });

  it("collapses repeated letters (druggsss → drugs)", () => {
    const v = detectWordPairViolations("buy druggsss", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
  });

  it("treats punctuation as separators", () => {
    const v = detectWordPairViolations(
      "buy...drugs, please",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toHaveLength(1);
    expect(v[0].distance).toBe(0);
  });

  it("de-obfuscates single-letter spacing (d r u g s)", () => {
    const v = detectWordPairViolations("buy d r u g s", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
  });

  it("de-obfuscates dotted spacing (d.r.u.g.s)", () => {
    const v = detectWordPairViolations("buy d.r.u.g.s", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
  });

  it("de-obfuscates multi-char splits (dr ugs)", () => {
    const v = detectWordPairViolations("buy dr ugs", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
  });

  it("collapses repeats across token boundaries (drug gs → druggs → drugs)", () => {
    const v = detectWordPairViolations("buy drug gs", MODERATED_WORD_PAIRS);
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it("collapses leading-char duplication (d drugs → ddrugs → drugs)", () => {
    const v = detectWordPairViolations("buy d drugs", MODERATED_WORD_PAIRS);
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it("does not match substrings (drugstore)", () => {
    const v = detectWordPairViolations(
      "buy drugstore items",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toEqual([]);
  });

  it("does not match substrings (hackathon)", () => {
    const v = detectWordPairViolations(
      "hackathon about system design",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toEqual([]);
  });

  it("strips diacritics", () => {
    const v = detectWordPairViolations("bùy drügs", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
  });

  it("handles fullwidth characters", () => {
    const v = detectWordPairViolations(
      "ｂｕｙ ｄｒｕｇｓ",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toHaveLength(1);
  });

  it("strips zero-width characters", () => {
    const v = detectWordPairViolations(
      "bu\u200By dru\u200Bgs",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toHaveLength(1);
  });

  it("returns all violations in the text", () => {
    const v = detectWordPairViolations(
      "buy drugs and sell drugs",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toHaveLength(4);
  });

  it("detects multiple rules triggered by overlapping text", () => {
    const v = detectWordPairViolations(
      "hack the system to buy drugs",
      MODERATED_WORD_PAIRS,
    );
    expect(v).toHaveLength(2);
    expect(v.map((x) => x.rule.w1).sort()).toEqual(["buy", "hack"]);
  });

  it("handles combined obfuscation (leet + punctuation + repeats)", () => {
    const v = detectWordPairViolations("s3ll...druggss", MODERATED_WORD_PAIRS);
    expect(v).toHaveLength(1);
  });

  it("returns empty for empty input", () => {
    expect(detectWordPairViolations("", MODERATED_WORD_PAIRS)).toEqual([]);
  });
});
