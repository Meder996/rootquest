import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { questionSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso, uid } from "@/lib/utils";
import type { Question, QuestionOption } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

interface QuestionRow extends Question {
  option_count: number;
  correct_count: number;
}

/** GET /api/admin/questions */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const params = request.nextUrl.searchParams;
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (params.get("search")) {
    conditions.push("q.prompt LIKE ?");
    values.push(`%${params.get("search")}%`);
  }
  if (params.get("type")) {
    conditions.push("q.type = ?");
    values.push(params.get("type"));
  }
  if (params.get("status")) {
    conditions.push("q.status = ?");
    values.push(params.get("status"));
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Number(params.get("limit")) || 200, 500);
  const questions = db.all<QuestionRow>(
    `SELECT q.*,
            (SELECT COUNT(*) FROM question_options o WHERE o.question_id = q.id) AS option_count,
            (SELECT COUNT(*) FROM question_options o WHERE o.question_id = q.id AND o.is_correct = 1) AS correct_count
     FROM questions q ${where} ORDER BY q.created_at DESC LIMIT ?`,
    ...values,
    limit
  );
  return json({ questions });
});

/** POST /api/admin/questions — create a question with its 4 options. */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireAdmin(request);
  const body = questionSchema.parse(await parseJsonBody(request));
  const id = uid();
  const status = body.status ?? "draft";
  db.run(
    `INSERT INTO questions
      (id, type, prompt, passage, related_part_id, difficulty, category, explanation, status, author, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    body.type,
    body.prompt,
    body.passage ?? null,
    body.relatedPartId ?? null,
    body.difficulty,
    body.category ?? null,
    body.explanation,
    status,
    body.author ?? user.name,
    nowIso(),
    nowIso()
  );
  body.options.forEach((option, index) => {
    db.run(
      "INSERT INTO question_options (id, question_id, text, is_correct, position) VALUES (?, ?, ?, ?, ?)",
      uid(),
      id,
      option.text,
      option.isCorrect,
      index
    );
  });
  logAdminAction(user.id, "question.create", "question", id, { type: body.type, status });
  const question = db.get<Question>("SELECT * FROM questions WHERE id = ?", id)!;
  const options = db.all<QuestionOption>(
    "SELECT * FROM question_options WHERE question_id = ? ORDER BY position",
    id
  );
  return json({ question: { ...question, options } }, { status: 201 });
});
