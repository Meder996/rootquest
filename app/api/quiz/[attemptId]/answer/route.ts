import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { submitQuizAnswer } from "@/lib/data/learning";
import { quizAnswerSchema } from "@/lib/validation/schemas";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** POST /api/quiz/[attemptId]/answer — submit one answer, get feedback. */
export const POST = handleApi(
  async (request: NextRequest, { params }: { params: { attemptId: string } }) => {
    const { user } = await requireUser(request);
    if (!rateLimit(clientKey(request, "quiz-answer"), 60, 60 * 1000)) {
      throw new ApiError(429, "Too many answers submitted. Please slow down.");
    }
    const body = quizAnswerSchema.parse(await parseJsonBody(request));
    const feedback = submitQuizAnswer(
      user.id,
      params.attemptId,
      body.questionId,
      body.optionId,
      body.timeMs ?? null
    );
    return json(feedback);
  }
);
