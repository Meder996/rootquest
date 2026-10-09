import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { startQuizAttempt } from "@/lib/data/learning";
import { quizStartSchema } from "@/lib/validation/schemas";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** POST /api/quiz/start — create a quiz attempt and receive its questions. */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  if (!rateLimit(clientKey(request, "quiz-start"), 20, 60 * 1000)) {
    throw new ApiError(429, "Too many quiz attempts. Please slow down.");
  }
  const body = quizStartSchema.parse(await parseJsonBody(request));
  const { attempt, questions } = startQuizAttempt(user.id, {
    mode: body.mode,
    category: body.category ?? null,
    difficulty: body.difficulty ?? null,
    lessonId: body.lessonId ?? null,
    count: body.count,
    timed: body.timed,
  });
  return json({
    attempt: {
      id: attempt.id,
      mode: attempt.mode,
      questionCount: attempt.question_count,
      startedAt: attempt.started_at,
      timed: body.timed,
    },
    questions,
  });
});
