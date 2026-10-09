import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getStats } from "@/lib/gamification";
import { handleApi, json, publicUser } from "@/lib/api-helpers";
import { xpLevel } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const GET = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const stats = getStats(user.id);
  return json({
    user: publicUser(user),
    stats: { ...stats, level: xpLevel(stats.xp) },
  });
});
