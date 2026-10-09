import { NextRequest } from "next/server";
import { handleApi, json } from "@/lib/api-helpers";
import { getSessionUser } from "@/lib/auth/guards";
import { listPublishedLessons } from "@/lib/data/library";
import { getLessonsWithProgress } from "@/lib/data/dashboard";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/lessons — published lessons, with progress when authenticated. */
export const GET = handleApi(async (_request: NextRequest) => {
  const ctx = await getSessionUser();
  if (ctx) {
    return json({ lessons: getLessonsWithProgress(ctx.user.id) });
  }
  return json({ lessons: listPublishedLessons().map((lesson) => ({
    lesson,
    totalParts: 0,
    masteredParts: 0,
    completionPct: 0,
    parts: [],
  })) });
});
