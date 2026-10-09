import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { getAchievementsWithStatus, getStats } from "@/lib/gamification";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/achievements — all achievements with the user's unlock state. */
export const GET = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const { achievements, earnedIds, earnedAt } = getAchievementsWithStatus(user.id);
  const stats = getStats(user.id);
  return json({
    achievements: achievements.map((a) => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: earnedAt.get(a.id) ?? null,
    })),
    totalXp: stats.xp,
  });
});
