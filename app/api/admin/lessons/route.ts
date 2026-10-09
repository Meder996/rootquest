import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { lessonSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso, uid } from "@/lib/utils";
import type { Lesson } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

interface LessonRow extends Lesson {
  part_count: number;
}

/** GET /api/admin/lessons */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const lessons = db.all<LessonRow>(
    `SELECT l.*,
            (SELECT COUNT(*) FROM lesson_word_parts lwp WHERE lwp.lesson_id = l.id) AS part_count
     FROM lessons l ORDER BY l.order_index, l.title`
  );
  return json({ lessons });
});

/** POST /api/admin/lessons */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireAdmin(request);
  const body = lessonSchema.parse(await parseJsonBody(request));
  const id = uid();
  db.run(
    `INSERT INTO lessons
      (id, title, description, category, difficulty, status, order_index, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    body.title,
    body.description ?? null,
    body.category ?? null,
    body.difficulty,
    body.status ?? "draft",
    body.orderIndex ?? 0,
    nowIso(),
    nowIso()
  );
  logAdminAction(user.id, "lesson.create", "lesson", id, { title: body.title });
  const lesson = db.get<Lesson>("SELECT * FROM lessons WHERE id = ?", id)!;
  return json({ lesson }, { status: 201 });
});
