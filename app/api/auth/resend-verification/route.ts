import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createToken } from "@/lib/auth/tokens";
import { requireUser } from "@/lib/auth/guards";
import { ApiError } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { handleApi, json } from "@/lib/api-helpers";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  if (user.email_verified === 1) {
    throw new ApiError(400, "Your email is already verified.");
  }
  if (!rateLimit(clientKey(request, "resend"), 3, 60 * 60 * 1000)) {
    throw new ApiError(429, "Too many requests. Please try again later.");
  }
  const { token } = createToken("email_verification_tokens", user.id, 24 * 7);
  return json({
    message: "Verification email sent.",
    devVerificationToken:
      process.env.NODE_ENV === "production" ? undefined : token,
  });
});
