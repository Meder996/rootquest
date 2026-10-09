import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { recordReview } from "@/lib/data/learning";
import { reviewSchema } from "@/lib/validation/schemas";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** POST /api/study/review — record a flashcard rating (Again/Hard/Good/Easy). */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  if (!rateLimit(clientKey(request, "review"), 120, 60 * 1000)) {
    throw new ApiError(429, "Slow down — too many reviews per minute.");
  }
  const body = reviewSchema.parse(await parseJsonBody(request));
  const outcome = recordReview(user.id, body.wordPartId, body.rating, body.sessionId ?? null);
  return json(outcome);
});
