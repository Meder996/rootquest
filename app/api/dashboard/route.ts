import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { getDashboardData } from "@/lib/data/dashboard";
import { xpLevel } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/dashboard — everything the student dashboard needs. */
export const GET = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const data = getDashboardData(user.id);
  return json({
    ...data,
    stats: { ...data.stats, level: xpLevel(data.stats.xp) },
  });
});
