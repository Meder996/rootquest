import { NextRequest } from "next/server";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import type { Question, QuestionOption } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/**
 * GET /api/questions/[id] — a published question WITH the correct-answer
 * flag. Used by the word-part details mini-check for instant feedback.
 * Quiz-taking uses /api/quiz/* which never exposes the answer key.
 */
export const GET = handleApi(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    const question = db.get<Question>(
      "SELECT * FROM questions WHERE id = ? AND status = 'published'",
      params.id
    );
    if (!question) throw new ApiError(404, "Question not found.");
    const options = db.all<QuestionOption>(
      "SELECT id, text, is_correct, position FROM question_options WHERE question_id = ? ORDER BY RANDOM()",
      params.id
    );
    return json({
      question: {
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        passage: question.passage,
        explanation: question.explanation,
      },
      options,
    });
  }
);
