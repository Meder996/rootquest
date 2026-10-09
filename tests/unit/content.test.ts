import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  ALL_WORD_PARTS,
  LESSONS,
  PART_COUNTS,
} from "@/lib/content";

describe("seed content", () => {
  it("includes at least 40 prefixes, 60 roots, and 30 suffixes", () => {
    expect(PART_COUNTS.prefixes).toBeGreaterThanOrEqual(40);
    expect(PART_COUNTS.roots).toBeGreaterThanOrEqual(60);
    expect(PART_COUNTS.suffixes).toBeGreaterThanOrEqual(30);
    expect(PART_COUNTS.total).toBe(130);
  });

  it("gives every part a meaning, description, mnemonic, and example word", () => {
    for (const part of ALL_WORD_PARTS) {
      expect(part.text.trim().length).toBeGreaterThan(0);
      expect(part.meaning.trim().length).toBeGreaterThan(0);
      expect(part.description.trim().length).toBeGreaterThan(10);
      expect(part.mnemonic.trim().length).toBeGreaterThan(0);
      expect(part.words.length).toBeGreaterThanOrEqual(1);
      for (const word of part.words) {
        expect(word.word.trim().length).toBeGreaterThan(0);
        expect(word.definition.trim().length).toBeGreaterThan(0);
        expect(word.sentence.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("provides at least 150 example words", () => {
    const total = ALL_WORD_PARTS.reduce((sum, p) => sum + p.words.length, 0);
    expect(total).toBeGreaterThanOrEqual(150);
  });

  it("has at least 10 lessons covering every word part", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(10);
    const knownTexts = new Set(ALL_WORD_PARTS.map((p) => p.text));
    const covered = new Set<string>();
    for (const lesson of LESSONS) {
      expect(lesson.parts.length).toBeGreaterThan(0);
      for (const partText of lesson.parts) {
        expect(knownTexts.has(partText)).toBe(true);
        covered.add(partText);
      }
    }
    expect(covered.size).toBe(ALL_WORD_PARTS.length);
  });

  it("defines at least 10 achievements with unique codes", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    const codes = ACHIEVEMENTS.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.name.length).toBeGreaterThan(0);
      expect(achievement.icon.length).toBeGreaterThan(0);
    }
  });
});
