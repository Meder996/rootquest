import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { getStudyItems } from "@/lib/data/learning";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/study/items?scope=due|new|mistakes|all&limit=50 */
export const GET = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const params = request.nextUrl.searchParams;
  const scope = (params.get("scope") ?? "due") as "due" | "new" | "mistakes" | "all";
  const limit = params.get("limit") ? Number(params.get("limit")) : 50;
  const items = getStudyItems(user.id, scope, limit);
  return json({ items, scope });
});
