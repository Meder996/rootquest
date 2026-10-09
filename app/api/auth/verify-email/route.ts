import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/auth/tokens";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { nowIso } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const GET = handleApi(async (request: NextRequest) => {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) throw new ApiError(400, "Verification token is required.");
  const userId = consumeToken("email_verification_tokens", token);
  if (!userId) {
    throw new ApiError(400, "This verification link is invalid or has expired.");
  }
  db.run(
    "UPDATE profiles SET email_verified = 1, updated_at = ? WHERE id = ?",
    nowIso(),
    userId
  );
  return json({ ok: true, message: "Your email has been verified." });
});
