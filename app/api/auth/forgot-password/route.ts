import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createToken } from "@/lib/auth/tokens";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { ApiError } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const POST = handleApi(async (request: NextRequest) => {
  if (!rateLimit(clientKey(request, "forgot"), 3, 60 * 60 * 1000)) {
    throw new ApiError(429, "Too many password reset requests. Please try again later.");
  }
  const body = forgotPasswordSchema.parse(await parseJsonBody(request));
  const user = db.get<{ id: string }>(
    "SELECT id FROM profiles WHERE email = ?",
    body.email
  );
  // Always respond the same way to avoid leaking which emails are registered.
  if (user) {
    const { token } = createToken("password_reset_tokens", user.id, 1);
    return json({
      message: "If that account exists, a reset link is on its way.",
      // In production the reset link is emailed instead of returned.
      devResetToken: process.env.NODE_ENV === "production" ? undefined : token,
    });
  }
  return json({ message: "If that account exists, a reset link is on its way." });
});
