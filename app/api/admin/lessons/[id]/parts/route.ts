import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { lessonPartsSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** PUT /api/admin/lessons/[id]/parts — replace the lesson's word-part list. */
export const PUT = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    const lesson = db.get("SELECT id FROM lessons WHERE id = ?", params.id);
    if (!lesson) throw new ApiError(404, "Lesson not found.");
    const body = lessonPartsSchema.parse(await parseJsonBody(request));
    db.run("DELETE FROM lesson_word_parts WHERE lesson_id = ?", params.id);
    body.partIds.forEach((partId, index) => {
      db.run(
        "INSERT INTO lesson_word_parts (lesson_id, word_part_id, position) VALUES (?, ?, ?)",
        params.id,
        partId,
        index
      );
    });
    db.run("UPDATE lessons SET updated_at = ? WHERE id = ?", nowIso(), params.id);
    logAdminAction(user.id, "lesson.parts", "lesson", params.id, {
      partCount: body.partIds.length,
    });
    return json({ ok: true });
  }
);
