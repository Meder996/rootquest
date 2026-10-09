import { db } from "@/lib/db";
import { nowIso, todayKey, uid } from "@/lib/utils";
import type { Achievement, UserStats } from "@/types";

/**
 * Gamification engine: XP, streaks, daily activity, and achievements.
 * All mutations happen server-side inside the API route handlers.
 */

export function getStats(userId: string): UserStats {
  let stats = db.get<UserStats>(
    "SELECT * FROM user_stats WHERE user_id = ?",
    userId
  );
  if (!stats) {
    db.run("INSERT INTO user_stats (user_id) VALUES (?)", userId);
    stats = db.get<UserStats>(
      "SELECT * FROM user_stats WHERE user_id = ?",
      userId
    )!;
  }
  return stats;
}

function yesterdayKey(timezone: string): string {
  const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

export interface ActivityDelta {
  xp?: number;
  reviews?: number;
  correct?: number;
  incorrect?: number;
  contextCorrect?: number;
  mistakesReviewed?: number;
}

/**
 * Record study activity: updates XP, daily activity, and the study streak.
 * Streak rules: studying on a new day extends the streak; studying again on
 * the same day changes nothing; missing a day resets the streak to 1.
 */
export function recordActivity(
  userId: string,
  timezone: string,
  delta: ActivityDelta
): UserStats {
  const stats = getStats(userId);
  const today = todayKey(timezone);
  const wasActiveToday = stats.last_study_date === today;

  let currentStreak = stats.current_streak;
  let studyDays = stats.study_days;
  let lastStudyDate = stats.last_study_date;

  if (!wasActiveToday) {
    if (stats.last_study_date === yesterdayKey(timezone)) {
      currentStreak = stats.current_streak + 1;
    } else {
      currentStreak = 1;
    }
    studyDays = stats.study_days + 1;
    lastStudyDate = today;
    db.run(
      `INSERT INTO daily_activity (user_id, date, reviews, xp)
       VALUES (?, ?, 0, 0)
       ON CONFLICT(user_id, date) DO NOTHING`,
      userId,
      today
    );
  }

  db.run(
    `UPDATE daily_activity
     SET reviews = reviews + ?, xp = xp + ?
     WHERE user_id = ? AND date = ?`,
    delta.reviews ?? 0,
    delta.xp ?? 0,
    userId,
    today
  );

  db.run(
    `UPDATE user_stats SET
       xp = xp + ?,
       total_reviews = total_reviews + ?,
       total_correct = total_correct + ?,
       total_incorrect = total_incorrect + ?,
       context_correct = context_correct + ?,
       mistakes_reviewed = mistakes_reviewed + ?,
       current_streak = ?,
       longest_streak = MAX(longest_streak, ?),
       study_days = ?,
       last_study_date = ?
     WHERE user_id = ?`,
    delta.xp ?? 0,
    delta.reviews ?? 0,
    delta.correct ?? 0,
    delta.incorrect ?? 0,
    delta.contextCorrect ?? 0,
    delta.mistakesReviewed ?? 0,
    currentStreak,
    currentStreak,
    studyDays,
    lastStudyDate,
    userId
  );

  return getStats(userId);
}

interface AchievementCheck {
  code: string;
  test: () => boolean;
}

function achievementChecks(userId: string): AchievementCheck[] {
  const scalar = (sql: string): number => {
    const row = db.get<{ value: number }>(sql, userId);
    return row?.value ?? 0;
  };
  return [
    {
      code: "first_sprout",
      test: () =>
        scalar(
          "SELECT COUNT(*) AS value FROM user_word_progress WHERE user_id = ? AND correct_count > 0"
        ) >= 1,
    },
    {
      code: "prefix_explorer",
      test: () =>
        scalar(
          `SELECT COUNT(*) AS value FROM user_word_progress p
           JOIN word_parts w ON w.id = p.word_part_id
           WHERE p.user_id = ? AND w.type = 'prefix' AND p.status = 'mastered'`
        ) >= 10,
    },
    {
      code: "root_forest_complete",
      test: () =>
        scalar(
          `SELECT COUNT(*) AS value FROM user_word_progress p
           JOIN word_parts w ON w.id = p.word_part_id
           WHERE p.user_id = ? AND w.type = 'root' AND p.status = 'mastered'`
        ) >= 25,
    },
    {
      code: "suffix_city_scholar",
      test: () =>
        scalar(
          `SELECT COUNT(*) AS value FROM user_word_progress p
           JOIN word_parts w ON w.id = p.word_part_id
           WHERE p.user_id = ? AND w.type = 'suffix' AND p.status = 'mastered'`
        ) >= 10,
    },
    {
      code: "seven_day_streak",
      test: () =>
        scalar(
          "SELECT longest_streak AS value FROM user_stats WHERE user_id = ?"
        ) >= 7,
    },
    {
      code: "hundred_correct",
      test: () =>
        scalar(
          "SELECT total_correct AS value FROM user_stats WHERE user_id = ?"
        ) >= 100,
    },
    {
      code: "sat_arena_champion",
      test: () =>
        scalar(
          "SELECT COUNT(*) AS value FROM quiz_attempts WHERE user_id = ? AND completed_at IS NOT NULL AND total >= 10 AND score = total"
        ) >= 1,
    },
    {
      code: "context_master",
      test: () =>
        scalar(
          "SELECT context_correct AS value FROM user_stats WHERE user_id = ?"
        ) >= 10,
    },
    {
      code: "error_fixer",
      test: () =>
        scalar(
          "SELECT mistakes_reviewed AS value FROM user_stats WHERE user_id = ?"
        ) >= 25,
    },
    {
      code: "word_collector",
      test: () =>
        scalar(
          "SELECT words_saved AS value FROM user_stats WHERE user_id = ?"
        ) >= 25,
    },
    {
      code: "weekly_goal",
      test: () =>
        scalar(
          `SELECT COUNT(*) AS value FROM daily_activity
           WHERE user_id = ? AND date >= date('now', '-7 days')`
        ) >= 5,
    },
  ];
}

/**
 * Evaluate all achievements and award any that are newly earned.
 * Returns the achievements awarded by this call (with their XP bonus).
 */
export function evaluateAchievements(userId: string): Achievement[] {
  const earned = new Set(
    db
      .all<{ code: string }>(
        `SELECT a.code FROM user_achievements ua
         JOIN achievements a ON a.id = ua.achievement_id
         WHERE ua.user_id = ?`,
        userId
      )
      .map((row) => row.code)
  );
  const all = db.all<Achievement>("SELECT * FROM achievements");
  const byId = new Map(all.map((a) => [a.id, a]));
  const awarded: Achievement[] = [];

  for (const check of achievementChecks(userId)) {
    if (earned.has(check.code)) continue;
    const achievement = all.find((a) => a.code === check.code);
    if (!achievement) continue;
    if (!check.test()) continue;
    db.run(
      "INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES (?, ?, ?)",
      userId,
      achievement.id,
      nowIso()
    );
    if (achievement.xp_bonus > 0) {
      db.run(
        "UPDATE user_stats SET xp = xp + ? WHERE user_id = ?",
        achievement.xp_bonus,
        userId
      );
    }
    awarded.push(achievement);
  }
  return awarded;
}

export function getAchievementsWithStatus(userId: string): {
  achievements: Achievement[];
  earnedIds: Set<string>;
  earnedAt: Map<string, string>;
} {
  const achievements = db.all<Achievement>(
    "SELECT * FROM achievements ORDER BY xp_bonus ASC, name ASC"
  );
  const rows = db.all<{ achievement_id: string; earned_at: string }>(
    "SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = ?",
    userId
  );
  return {
    achievements,
    earnedIds: new Set(rows.map((r) => r.achievement_id)),
    earnedAt: new Map(rows.map((r) => [r.achievement_id, r.earned_at])),
  };
}

export function incrementWordsSaved(userId: string, delta: number): void {
  db.run(
    "UPDATE user_stats SET words_saved = words_saved + ? WHERE user_id = ?",
    delta,
    userId
  );
}

export function incrementQuizzesCompleted(userId: string): void {
  db.run(
    "UPDATE user_stats SET quizzes_completed = quizzes_completed + 1 WHERE user_id = ?",
    userId
  );
}

export { uid };
