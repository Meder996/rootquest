export interface QuizAnswerInput {
  isCorrect: boolean;
  timeMs?: number | null;
}

export interface QuizScore {
  score: number;
  total: number;
  accuracy: number; // 0..1
}

export function scoreQuiz(answers: QuizAnswerInput[]): QuizScore {
  const total = answers.length;
  const score = answers.filter((a) => a.isCorrect).length;
  return {
    score,
    total,
    accuracy: total === 0 ? 0 : score / total,
  };
}

/** XP for finishing a quiz: 25 base + 5 per correct + 25 perfect bonus. */
export function xpForQuiz(score: number, total: number): number {
  if (total <= 0) return 0;
  const perfect = score === total ? 25 : 0;
  return 25 + score * 5 + perfect;
}

export function averageTimeMs(answers: QuizAnswerInput[]): number | null {
  const times = answers
    .map((a) => a.timeMs)
    .filter((t): t is number => typeof t === "number" && t > 0);
  if (times.length === 0) return null;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}
