import { db } from "@/lib/db";
import { getStats } from "@/lib/gamification";
import type { QuizAttempt, UserStats } from "@/types";

/**
 * Progress analytics for the student Progress page.
 */

export interface AnalyticsData {
  stats: UserStats;
  accuracy: number;
  averageQuizScore: number;
  dailyActivity: { date: string; reviews: number; xp: number }[];
  masteryDistribution: Record<string, number>;
  categoryBreakdown: {
    category: string;
    totalParts: number;
    masteredParts: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  }[];
  quizHistory: (QuizAttempt & { accuracy: number })[];
}

export function getAnalytics(userId: string): AnalyticsData {
  const stats = getStats(userId);
  const totalAnswers = stats.total_correct + stats.total_incorrect;
  const accuracy =
    totalAnswers > 0 ? Math.round((stats.total_correct / totalAnswers) * 100) : 0;

  // Last 14 days of activity.
  const start = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const dailyActivity = db.all<{ date: string; reviews: number; xp: number }>(
    `SELECT date, reviews, xp FROM daily_activity
     WHERE user_id = ? AND date >= ?
     ORDER BY date ASC`,
    userId,
    start
  );

  // Mastery distribution.
  const distributionRows = db.all<{ status: string; n: number }>(
    `SELECT p.status, COUNT(*) AS n
     FROM user_word_progress p
     JOIN word_parts w ON w.id = p.word_part_id AND w.status = 'published'
     WHERE p.user_id = ?
     GROUP BY p.status`,
    userId
  );
  const masteryDistribution: Record<string, number> = {
    new: 0,
    learning: 0,
    familiar: 0,
    strong: 0,
    mastered: 0,
  };
  for (const row of distributionRows) masteryDistribution[row.status] = row.n;

  // Category breakdown.
  const categoryRows = db.all<{
    category: string;
    correct: number;
    incorrect: number;
  }>(
    `SELECT w.category AS category,
            SUM(p.correct_count) AS correct,
            SUM(p.incorrect_count) AS incorrect
     FROM user_word_progress p
     JOIN word_parts w ON w.id = p.word_part_id AND w.status = 'published'
     WHERE p.user_id = ? AND w.category IS NOT NULL
     GROUP BY w.category
     ORDER BY w.category`,
    userId
  );
  const categoryBreakdown = categoryRows.map((row) => {
    const totals = db.get<{ total: number; mastered: number }>(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN p.status IN ('strong','mastered') THEN 1 ELSE 0 END) AS mastered
       FROM word_parts w
       LEFT JOIN user_word_progress p ON p.word_part_id = w.id AND p.user_id = ?
       WHERE w.status = 'published' AND w.category = ?`,
      userId,
      row.category
    );
    const answers = row.correct + row.incorrect;
    return {
      category: row.category,
      totalParts: totals?.total ?? 0,
      masteredParts: totals?.mastered ?? 0,
      correct: row.correct,
      incorrect: row.incorrect,
      accuracy: answers > 0 ? Math.round((row.correct / answers) * 100) : 0,
    };
  });

  // Quiz history (last 10 completed attempts).
  const quizHistory = db
    .all<QuizAttempt>(
      `SELECT * FROM quiz_attempts
       WHERE user_id = ? AND completed_at IS NOT NULL
       ORDER BY completed_at DESC LIMIT 10`,
      userId
    )
    .map((attempt) => ({
      ...attempt,
      accuracy:
        attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0,
    }));

  const completedQuizzes = quizHistory;
  const averageQuizScore =
    completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce((sum, q) => sum + q.accuracy, 0) /
            completedQuizzes.length
        )
      : 0;

  return {
    stats,
    accuracy,
    averageQuizScore,
    dailyActivity,
    masteryDistribution,
    categoryBreakdown,
    quizHistory,
  };
}
