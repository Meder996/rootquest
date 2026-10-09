import { NextRequest } from "next/server";
import { handleApi, json } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { sampleQuestions } from "@/lib/data/library";
import type { QuestionOption } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/demo/questions — 5 public sample questions for the landing page. */
export const GET = handleApi(async (_request: NextRequest) => {
  const questions = sampleQuestions({ type: "meaning", count: 5 });
  return json({
    questions: questions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      passage: q.passage,
      difficulty: q.difficulty,
      category: q.category,
      options: db
        .all<QuestionOption>(
          "SELECT id, text, position FROM question_options WHERE question_id = ? ORDER BY RANDOM()",
          q.id
        )
        .map((o) => ({ id: o.id, text: o.text, position: o.position })),
    })),
  });
});
