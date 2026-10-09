import { NextRequest } from "next/server";
import { handleApi, json } from "@/lib/api-helpers";
import { getCategories, listPublishedWordParts } from "@/lib/data/library";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/word-parts — published library with search & filters. */
export const GET = handleApi(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const { parts, total } = listPublishedWordParts({
    search: params.get("search") ?? undefined,
    type: (params.get("type") as "prefix" | "root" | "suffix" | null) ?? undefined,
    difficulty:
      (params.get("difficulty") as "beginner" | "intermediate" | "advanced" | null) ??
      undefined,
    category: params.get("category") ?? undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    offset: params.get("offset") ? Number(params.get("offset")) : undefined,
  });
  return json({ parts, total, categories: getCategories() });
});
