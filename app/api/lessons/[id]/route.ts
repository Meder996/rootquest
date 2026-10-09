import { NextRequest } from "next/server";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { getLessonParts, getPublishedLesson } from "@/lib/data/library";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/lessons/[id] — lesson with its published word parts. */
export const GET = handleApi(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    const lesson = getPublishedLesson(params.id);
    if (!lesson) throw new ApiError(404, "Lesson not found.");
    const parts = getLessonParts(lesson.id);
    return json({ lesson, parts });
  }
);
