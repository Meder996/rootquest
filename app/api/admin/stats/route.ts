import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/admin/stats — counts for the admin dashboard. */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const count = (sql: string) => db.get<{ n: number }>(sql)?.n ?? 0;
  return json({
    users: count("SELECT COUNT(*) AS n FROM profiles"),
    students: count("SELECT COUNT(*) AS n FROM profiles WHERE role = 'student'"),
    wordParts: count("SELECT COUNT(*) AS n FROM word_parts"),
    publishedParts: count("SELECT COUNT(*) AS n FROM word_parts WHERE status = 'published'"),
    draftParts: count("SELECT COUNT(*) AS n FROM word_parts WHERE status = 'draft'"),
    words: count("SELECT COUNT(*) AS n FROM words"),
    questions: count("SELECT COUNT(*) AS n FROM questions"),
    publishedQuestions: count("SELECT COUNT(*) AS n FROM questions WHERE status = 'published'"),
    lessons: count("SELECT COUNT(*) AS n FROM lessons"),
    studySessions: count("SELECT COUNT(*) AS n FROM study_sessions"),
    quizAttempts: count("SELECT COUNT(*) AS n FROM quiz_attempts WHERE completed_at IS NOT NULL"),
    openFeedback: count("SELECT COUNT(*) AS n FROM feedback WHERE status = 'new'"),
    totalXp: count("SELECT COALESCE(SUM(xp), 0) AS n FROM user_stats"),
  });
});
