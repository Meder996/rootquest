import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { getQuizResults } from "@/lib/data/learning";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/quiz/[attemptId]/results — full results with explanations. */
export const GET = handleApi(
  async (request: NextRequest, { params }: { params: { attemptId: string } }) => {
    const { user } = await requireUser(request);
    const results = getQuizResults(user.id, params.attemptId);
    return json(results);
  }
);
