import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/admin/reports — aggregated platform analytics. */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const count = (sql: string, ...params: unknown[]) =>
    db.get<{ n: number }>(sql, ...params)?.n ?? 0;

  const signupsLast7Days = db.all<{ date: string; n: number }>(
    `SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS n
     FROM profiles WHERE created_at >= datetime('now', '-7 days')
     GROUP BY date ORDER BY date`
  );
  const reviewsLast7Days = db.all<{ date: string; n: number }>(
    `SELECT date, SUM(reviews) AS n FROM daily_activity
     WHERE date >= date('now', '-7 days') GROUP BY date ORDER BY date`
  );
  const quizStats = db.get<{
    attempts: number;
    avg_score: number;
    avg_total: number;
  }>(
    `SELECT COUNT(*) AS attempts,
            AVG(score) AS avg_score,
            AVG(total) AS avg_total
     FROM quiz_attempts WHERE completed_at IS NOT NULL`
  );
  const topParts = db.all<{ text: string; type: string; n: number }>(
    `SELECT w.text, w.type, COUNT(*) AS n
     FROM user_word_progress p JOIN word_parts w ON w.id = p.word_part_id
     GROUP BY p.word_part_id ORDER BY n DESC LIMIT 10`
  );
  const masteryDistribution = db.all<{ status: string; n: number }>(
    `SELECT status, COUNT(*) AS n FROM user_word_progress GROUP BY status`
  );
  const recentFeedback = db.all(
    `SELECT f.*, p.email AS user_email FROM feedback f
     LEFT JOIN profiles p ON p.id = f.user_id
     ORDER BY f.created_at DESC LIMIT 20`
  );

  return json({
    totals: {
      users: count("SELECT COUNT(*) AS n FROM profiles"),
      activeToday: count(
        "SELECT COUNT(*) AS n FROM daily_activity WHERE date = date('now')"
      ),
      reviewsToday: count(
        "SELECT COALESCE(SUM(reviews), 0) AS n FROM daily_activity WHERE date = date('now')"
      ),
      quizzesCompleted: count(
        "SELECT COUNT(*) AS n FROM quiz_attempts WHERE completed_at IS NOT NULL"
      ),
    },
    signupsLast7Days,
    reviewsLast7Days,
    quizStats: {
      attempts: quizStats?.attempts ?? 0,
      averageAccuracy:
        quizStats && quizStats.avg_total > 0
          ? Math.round((quizStats.avg_score / quizStats.avg_total) * 100)
          : 0,
    },
    topParts,
    masteryDistribution,
    recentFeedback,
  });
});
