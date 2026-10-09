import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { questionSchema, questionUpdateSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso, uid } from "@/lib/utils";
import type { Question, QuestionOption } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

function getQuestionOr404(id: string): Question {
  const question = db.get<Question>("SELECT * FROM questions WHERE id = ?", id);
  if (!question) throw new ApiError(404, "Question not found.");
  return question;
}

function loadWithOptions(id: string) {
  const question = getQuestionOr404(id);
  const options = db.all<QuestionOption>(
    "SELECT * FROM question_options WHERE question_id = ? ORDER BY position",
    id
  );
  return { ...question, options };
}

/** GET /api/admin/questions/[id] */
export const GET = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin(request);
    return json({ question: loadWithOptions(params.id) });
  }
);

/** PATCH /api/admin/questions/[id] — update fields; replaces options when given. */
export const PATCH = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    const existing = getQuestionOr404(params.id);
    const body = questionUpdateSchema.parse(await parseJsonBody(request));

    // If publishing, re-validate the full question (incl. existing options).
    const nextStatus = body.status ?? existing.status;
    if (nextStatus === "published") {
      const currentOptions = db.all<QuestionOption>(
        "SELECT * FROM question_options WHERE question_id = ? ORDER BY position",
        params.id
      );
      const merged = body.options
        ? body.options
        : currentOptions.map((o) => ({ text: o.text, isCorrect: o.is_correct === 1 }));
      questionSchema.parse({
        type: body.type ?? existing.type,
        prompt: body.prompt ?? existing.prompt,
        passage: body.passage !== undefined ? body.passage : existing.passage,
        relatedPartId:
          body.relatedPartId !== undefined ? body.relatedPartId : existing.related_part_id,
        difficulty: body.difficulty ?? existing.difficulty,
        category: body.category !== undefined ? body.category : existing.category,
        explanation: body.explanation ?? existing.explanation,
        author: body.author !== undefined ? body.author : existing.author,
        status: "published",
        options: merged,
      });
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, unknown> = {
      type: body.type,
      prompt: body.prompt,
      passage: body.passage ?? null,
      related_part_id: body.relatedPartId ?? null,
      difficulty: body.difficulty,
      category: body.category ?? null,
      explanation: body.explanation,
      author: body.author ?? null,
      status: body.status,
    };
    for (const [column, value] of Object.entries(map)) {
      if (value !== undefined) {
        sets.push(`${column} = ?`);
        values.push(value);
      }
    }
    sets.push("updated_at = ?");
    values.push(nowIso(), params.id);
    db.run(`UPDATE questions SET ${sets.join(", ")} WHERE id = ?`, ...values);

    if (body.options) {
      db.run("DELETE FROM question_options WHERE question_id = ?", params.id);
      body.options.forEach((option, index) => {
        db.run(
          "INSERT INTO question_options (id, question_id, text, is_correct, position) VALUES (?, ?, ?, ?, ?)",
          uid(),
          params.id,
          option.text,
          option.isCorrect,
          index
        );
      });
    }

    const action =
      body.status && body.status !== existing.status
        ? `question.${body.status}`
        : "question.update";
    logAdminAction(user.id, action, "question", params.id, { status: nextStatus });
    return json({ question: loadWithOptions(params.id) });
  }
);

/** DELETE /api/admin/questions/[id] — archive. */
export const DELETE = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    getQuestionOr404(params.id);
    db.run(
      "UPDATE questions SET status = 'archived', updated_at = ? WHERE id = ?",
      nowIso(),
      params.id
    );
    logAdminAction(user.id, "question.archive", "question", params.id, {});
    return json({ ok: true });
  }
);
