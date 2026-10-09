import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { finishQuizAttempt } from "@/lib/data/learning";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** POST /api/quiz/[attemptId]/finish — finalize scoring, XP, achievements. */
export const POST = handleApi(
  async (request: NextRequest, { params }: { params: { attemptId: string } }) => {
    const { user } = await requireUser(request);
    const results = finishQuizAttempt(user.id, params.attemptId);
    return json({
      attemptId: results.attempt.id,
      score: results.score,
      total: results.total,
      accuracy: results.accuracy,
      xp: results.xp,
      durationSeconds: results.durationSeconds,
      newAchievements: results.newAchievements,
    });
  }
);
