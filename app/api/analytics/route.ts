import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { getAnalytics } from "@/lib/data/analytics";
import { xpLevel } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/analytics — progress analytics for the Progress page. */
export const GET = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const data = getAnalytics(user.id);
  return json({ ...data, stats: { ...data.stats, level: xpLevel(data.stats.xp) } });
});
