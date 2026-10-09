import { db } from "@/lib/db";
import { getStats } from "@/lib/gamification";
import { countDueItems } from "./learning";
import type { Achievement, Lesson, Profile, UserStats, WordPart } from "@/types";

/**
 * Aggregated data for the student dashboard.
 */

export interface WeeklyPoint {
  date: string;
  reviews: number;
  xp: number;
}

export interface WeakestCategory {
  category: string;
  accuracy: number;
  reviews: number;
}

export interface UpcomingReview {
  partId: string;
  text: string;
  type: string;
  status: string;
  nextReviewAt: string | null;
}

export interface RecommendedLesson {
  lesson: Lesson;
  totalParts: number;
  masteredParts: number;
  completionPct: number;
}

export interface DashboardData {
  profile: Profile;
  stats: UserStats;
  dueCount: number;
  todayReviews: number;
  dailyGoal: number;
  goalPct: number;
  masteryPct: number;
  masteryDistribution: Record<string, number>;
  weeklyChart: WeeklyPoint[];
  recommendedLesson: RecommendedLesson | null;
  recentAchievements: (Achievement & { earned_at: string })[];
  weakestCategories: WeakestCategory[];
  upcomingReviews: UpcomingReview[];
}

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function getDashboardData(userId: string): DashboardData {
  const profile = db.get<Profile>(
    "SELECT * FROM profiles WHERE id = ?",
    userId
  )!;
  const stats = getStats(userId);
  const dueCount = countDueItems(userId);

  const today = new Date().toISOString().slice(0, 10);
  const todayRow = db.get<{ reviews: number }>(
    "SELECT reviews FROM daily_activity WHERE user_id = ? AND date = ?",
    userId,
    today
  );
  const todayReviews = todayRow?.reviews ?? 0;
  const goalPct = Math.min(
    100,
    Math.round((todayReviews / Math.max(1, profile.daily_goal)) * 100)
  );

  // Mastery: weighted progress across all published parts.
  const totalPublished =
    db.get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM word_parts WHERE status = 'published'"
    )?.n ?? 0;
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
  let weighted = 0;
  for (const row of distributionRows) {
    masteryDistribution[row.status] = row.n;
  }
  const seen = Object.values(masteryDistribution).reduce((a, b) => a + b, 0);
  const weights: Record<string, number> = {
    new: 0,
    learning: 0.25,
    familiar: 0.5,
    strong: 0.75,
    mastered: 1,
  };
  weighted =
    (masteryDistribution.learning ?? 0) * weights.learning +
    (masteryDistribution.familiar ?? 0) * weights.familiar +
    (masteryDistribution.strong ?? 0) * weights.strong +
    (masteryDistribution.mastered ?? 0) * weights.mastered;
  const unseen = Math.max(0, totalPublished - seen);
  const masteryPct =
    totalPublished > 0
      ? Math.round(((weighted + unseen * 0) / totalPublished) * 100)
      : 0;

  // Weekly chart (last 7 days of activity).
  const days = last7Days();
  const activityRows = db.all<{ date: string; reviews: number; xp: number }>(
    "SELECT date, reviews, xp FROM daily_activity WHERE user_id = ? AND date >= ?",
    userId,
    days[0]
  );
  const byDate = new Map(activityRows.map((r) => [r.date, r]));
  const weeklyChart: WeeklyPoint[] = days.map((date) => ({
    date,
    reviews: byDate.get(date)?.reviews ?? 0,
    xp: byDate.get(date)?.xp ?? 0,
  }));

  // Recommended lesson: first published lesson not fully mastered.
  const lessons = db.all<Lesson>(
    "SELECT * FROM lessons WHERE status = 'published' ORDER BY order_index"
  );
  let recommendedLesson: RecommendedLesson | null = null;
  for (const lesson of lessons) {
    const parts = db.all<{ word_part_id: string }>(
      "SELECT word_part_id FROM lesson_word_parts WHERE lesson_id = ?",
      lesson.id
    );
    if (parts.length === 0) continue;
    const ids = parts.map((p) => p.word_part_id);
    const placeholders = ids.map(() => "?").join(", ");
    const mastered = db.get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM user_word_progress
       WHERE user_id = ? AND word_part_id IN (${placeholders}) AND status IN ('strong', 'mastered')`,
      userId,
      ...ids
    )?.n ?? 0;
    const completionPct = Math.round((mastered / ids.length) * 100);
    if (completionPct < 100) {
      recommendedLesson = {
        lesson,
        totalParts: ids.length,
        masteredParts: mastered,
        completionPct,
      };
      break;
    }
  }

  // Recent achievements.
  const recentAchievements = db.all<Achievement & { earned_at: string }>(
    `SELECT a.*, ua.earned_at FROM user_achievements ua
     JOIN achievements a ON a.id = ua.achievement_id
     WHERE ua.user_id = ?
     ORDER BY ua.earned_at DESC LIMIT 5`,
    userId
  );

  // Weakest categories (by accuracy over reviewed items).
  const categoryRows = db.all<{
    category: string;
    correct: number;
    incorrect: number;
    reviews: number;
  }>(
    `SELECT w.category AS category,
            SUM(p.correct_count) AS correct,
            SUM(p.incorrect_count) AS incorrect,
            SUM(p.correct_count + p.incorrect_count) AS reviews
     FROM user_word_progress p
     JOIN word_parts w ON w.id = p.word_part_id AND w.status = 'published'
     WHERE p.user_id = ? AND w.category IS NOT NULL
     GROUP BY w.category
     HAVING reviews > 0
     ORDER BY (CAST(correct AS REAL) / reviews) ASC
     LIMIT 3`,
    userId
  );
  const weakestCategories: WeakestCategory[] = categoryRows.map((r) => ({
    category: r.category,
    accuracy: r.reviews > 0 ? Math.round((r.correct / r.reviews) * 100) : 0,
    reviews: r.reviews,
  }));

  // Upcoming reviews.
  const upcomingReviews = db.all<UpcomingReview>(
    `SELECT w.id AS partId, w.text, w.type, p.status, p.next_review_at AS nextReviewAt
     FROM user_word_progress p
     JOIN word_parts w ON w.id = p.word_part_id AND w.status = 'published'
     WHERE p.user_id = ? AND p.next_review_at IS NOT NULL AND p.next_review_at > ?
     ORDER BY p.next_review_at ASC LIMIT 5`,
    userId,
    new Date().toISOString()
  );

  return {
    profile,
    stats,
    dueCount,
    todayReviews,
    dailyGoal: profile.daily_goal,
    goalPct,
    masteryPct,
    masteryDistribution,
    weeklyChart,
    recommendedLesson,
    recentAchievements,
    weakestCategories,
    upcomingReviews,
  };
}

/** Per-lesson progress for the Learn page. */
export interface LessonProgress {
  lesson: Lesson;
  totalParts: number;
  masteredParts: number;
  completionPct: number;
  parts: (Omit<WordPart, "status"> & { status: string })[];
}

export function getLessonsWithProgress(userId: string): LessonProgress[] {
  const lessons = db.all<Lesson>(
    "SELECT * FROM lessons WHERE status = 'published' ORDER BY order_index"
  );
  return lessons.map((lesson) => {
    const parts = db.all<Omit<WordPart, "status"> & { status: string }>(
      `SELECT w.*, COALESCE(p.status, 'new') AS status
       FROM word_parts w
       JOIN lesson_word_parts l ON l.word_part_id = w.id
       LEFT JOIN user_word_progress p ON p.word_part_id = w.id AND p.user_id = ?
       WHERE l.lesson_id = ? AND w.status = 'published'
       ORDER BY l.position`,
      userId,
      lesson.id
    );
    const masteredParts = parts.filter(
      (p) => p.status === "strong" || p.status === "mastered"
    ).length;
    return {
      lesson,
      totalParts: parts.length,
      masteredParts,
      completionPct:
        parts.length > 0 ? Math.round((masteredParts / parts.length) * 100) : 0,
      parts,
    };
  });
}
