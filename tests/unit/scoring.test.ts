import { describe, expect, it } from "vitest";
import { averageTimeMs, scoreQuiz, xpForQuiz } from "@/lib/quiz/scoring";

describe("quiz scoring", () => {
  it("scores answers and computes accuracy", () => {
    const result = scoreQuiz([
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
      { isCorrect: true },
    ]);
    expect(result.score).toBe(3);
    expect(result.total).toBe(4);
    expect(result.accuracy).toBeCloseTo(0.75);
  });

  it("handles empty quizzes", () => {
    const result = scoreQuiz([]);
    expect(result.accuracy).toBe(0);
  });

  it("awards XP with a perfect bonus", () => {
    expect(xpForQuiz(10, 10)).toBe(25 + 50 + 25);
    expect(xpForQuiz(7, 10)).toBe(25 + 35);
    expect(xpForQuiz(0, 0)).toBe(0);
  });

  it("averages answer times", () => {
    expect(averageTimeMs([{ isCorrect: true, timeMs: 1000 }, { isCorrect: true, timeMs: 3000 }])).toBe(2000);
    expect(averageTimeMs([{ isCorrect: true }])).toBeNull();
  });
});
