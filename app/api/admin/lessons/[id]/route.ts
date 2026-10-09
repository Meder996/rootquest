import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { lessonSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso } from "@/lib/utils";
import type { Lesson } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

function getLessonOr404(id: string): Lesson {
  const lesson = db.get<Lesson>("SELECT * FROM lessons WHERE id = ?", id);
  if (!lesson) throw new ApiError(404, "Lesson not found.");
  return lesson;
}

/** GET /api/admin/lessons/[id] — lesson with its parts. */
export const GET = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin(request);
    const lesson = getLessonOr404(params.id);
    const parts = db.all(
      `SELECT w.*, l.position FROM word_parts w
       JOIN lesson_word_parts l ON l.word_part_id = w.id
       WHERE l.lesson_id = ? ORDER BY l.position`,
      params.id
    );
    return json({ lesson, parts });
  }
);

/** PATCH /api/admin/lessons/[id] */
export const PATCH = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    const existing = getLessonOr404(params.id);
    const body = lessonSchema.partial().parse(await parseJsonBody(request));
    const sets: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, unknown> = {
      title: body.title,
      description: body.description ?? null,
      category: body.category ?? null,
      difficulty: body.difficulty,
      status: body.status,
      order_index: body.orderIndex,
    };
    for (const [column, value] of Object.entries(map)) {
      if (value !== undefined) {
        sets.push(`${column} = ?`);
        values.push(value);
      }
    }
    sets.push("updated_at = ?");
    values.push(nowIso(), params.id);
    db.run(`UPDATE lessons SET ${sets.join(", ")} WHERE id = ?`, ...values);
    const action =
      body.status && body.status !== existing.status
        ? `lesson.${body.status}`
        : "lesson.update";
    logAdminAction(user.id, action, "lesson", params.id, { title: body.title ?? existing.title });
    return json({ lesson: getLessonOr404(params.id) });
  }
);

/** DELETE /api/admin/lessons/[id] — archive. */
export const DELETE = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    getLessonOr404(params.id);
    db.run(
      "UPDATE lessons SET status = 'archived', updated_at = ? WHERE id = ?",
      nowIso(),
      params.id
    );
    logAdminAction(user.id, "lesson.archive", "lesson", params.id, {});
    return json({ ok: true });
  }
);
