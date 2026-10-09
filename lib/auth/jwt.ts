import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { SESSION_MAX_AGE_SECONDS } from "./constants";

export interface SessionTokenPayload extends JWTPayload {
  sub: string; // user id
  sid: string; // session id
  role: string;
}

function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || "rootquest-dev-secret-change-me-in-production";
  return new TextEncoder().encode(secret);
}

export { SESSION_MAX_AGE_SECONDS };

export async function signSessionToken(
  payload: { sub: string; sid: string; role: string },
  expiresInSeconds: number = SESSION_MAX_AGE_SECONDS
): Promise<string> {
  return new SignJWT({ sub: payload.sub, sid: payload.sid, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as SessionTokenPayload;
}
