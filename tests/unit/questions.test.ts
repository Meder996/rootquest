import { describe, expect, it } from "vitest";
import { ALL_WORD_PARTS } from "@/lib/content";
import { generateQuestions } from "@/lib/content/questions";

describe("question generation", () => {
  const questions = generateQuestions(ALL_WORD_PARTS);

  it("generates at least 200 questions", () => {
    expect(questions.length).toBeGreaterThanOrEqual(200);
  });

  it("gives every question exactly 4 options with exactly one correct", () => {
    for (const q of questions) {
      expect(q.options.length).toBe(4);
      expect(q.options.filter((o) => o.isCorrect).length).toBe(1);
      const texts = q.options.map((o) => o.text);
      expect(new Set(texts).size).toBe(4); // no duplicate options
    }
  });

  it("includes every required question type", () => {
    const types = new Set(questions.map((q) => q.type));
    for (const type of ["meaning", "infer", "context", "example", "compare"]) {
      expect(types.has(type as never)).toBe(true);
    }
  });

  it("writes an explanation and prompt for every question", () => {
    for (const q of questions) {
      expect(q.prompt.trim().length).toBeGreaterThan(10);
      expect(q.explanation.trim().length).toBeGreaterThan(10);
    }
  });

  it("includes a passage for context questions", () => {
    const contextQuestions = questions.filter((q) => q.type === "context");
    expect(contextQuestions.length).toBeGreaterThan(0);
    for (const q of contextQuestions) {
      expect(q.passage).toBeTruthy();
    }
  });
});
