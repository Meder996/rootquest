/**
 * Auth constants shared by edge-safe modules (middleware) and the
 * Node.js server runtime. This module must stay dependency-free.
 */
export const SESSION_COOKIE = "rq_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
