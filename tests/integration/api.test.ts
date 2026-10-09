import { beforeAll, describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { seedTestDatabase } from "../helpers";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { nowIso, uid } from "@/lib/utils";
import type { QuestionOption, WordPart } from "@/types";

import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { GET as meGET } from "@/app/api/auth/me/route";
import { GET as wordPartsGET } from "@/app/api/word-parts/route";
import { POST as reviewPOST } from "@/app/api/study/review/route";
import { GET as studyItemsGET } from "@/app/api/study/items/route";
import { POST as quizStartPOST } from "@/app/api/quiz/start/route";
import { POST as quizAnswerPOST } from "@/app/api/quiz/[attemptId]/answer/route";
import { POST as quizFinishPOST } from "@/app/api/quiz/[attemptId]/finish/route";
import { GET as quizResultsGET } from "@/app/api/quiz/[attemptId]/results/route";
import { GET as dashboardGET } from "@/app/api/dashboard/route";
import { GET as analyticsGET } from "@/app/api/analytics/route";
import { GET as achievementsGET } from "@/app/api/achievements/route";
import { GET as adminStatsGET } from "@/app/api/admin/stats/route";
import { POST as adminWordPartPOST } from "@/app/api/admin/word-parts/route";
import { PATCH as adminWordPartPATCH } from "@/app/api/admin/word-parts/[id]/route";
import { POST as adminQuestionPOST } from "@/app/api/admin/questions/route";
import { GET as adminAuditLogGET } from "@/app/api/admin/audit-log/route";

// ------------------------------------------------------------ test utils --

function req(
  url: string,
  init: { method?: string; body?: unknown; token?: string } = {}
): NextRequest {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (init.token) headers["cookie"] = `rq_session=${init.token}`;
  return new NextRequest(`http://localhost:3000${url}`, {
    method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    headers,
  });
}

function sessionCookie(res: NextResponse): string | undefined {
  return res.cookies.get("rq_session")?.value;
}

async function login(email: string, password: string): Promise<string> {
  const res = await loginPOST(
    req("/api/auth/login", { body: { email, password } })
  );
  expect(res.status).toBe(200);
  const token = sessionCookie(res);
  expect(token).toBeTruthy();
  return token!;
}

// ------------------------------------------------------------------ state --

let studentToken = "";
let otherToken = "";
let attemptId = "";
let partId = "";

const STUDENT = { name: "Test Student", email: "student@test.dev", password: "Password1!" };
const OTHER = { name: "Other User", email: "other@test.dev", password: "Password1!" };

beforeAll(async () => {
  await seedTestDatabase({ includeUsers: true });
  const part = db.get<WordPart>(
    "SELECT * FROM word_parts WHERE status = 'published' LIMIT 1"
  )!;
  partId = part.id;
});

describe("authentication and authorization", () => {
  it("rejects unauthenticated access to protected APIs", async () => {
    expect((await meGET(req("/api/auth/me"))).status).toBe(401);
    expect((await dashboardGET(req("/api/dashboard"))).status).toBe(401);
    expect((await analyticsGET(req("/api/analytics"))).status).toBe(401);
    expect((await achievementsGET(req("/api/achievements"))).status).toBe(401);
  });

  it("registers a new user and returns a session", async () => {
    const res = await registerPOST(req("/api/auth/register", { body: STUDENT }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe(STUDENT.email);
    expect(body.user.role).toBe("student");
    studentToken = sessionCookie(res)!;
    expect(studentToken).toBeTruthy();
  });

  it("rejects duplicate registration", async () => {
    const res = await registerPOST(req("/api/auth/register", { body: STUDENT }));
    expect(res.status).toBe(409);
  });

  it("rejects wrong passwords and accepts correct ones", async () => {
    const bad = await loginPOST(
      req("/api/auth/login", {
        body: { email: STUDENT.email, password: "wrong-password" },
      })
    );
    expect(bad.status).toBe(401);
    const good = await loginPOST(
      req("/api/auth/login", {
        body: { email: STUDENT.email, password: STUDENT.password },
      })
    );
    expect(good.status).toBe(200);
  });

  it("returns the session user from /api/auth/me", async () => {
    const res = await meGET(req("/api/auth/me", { token: studentToken }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe(STUDENT.email);
    expect(body.stats.xp).toBeGreaterThanOrEqual(0);
  });

  it("blocks students from admin APIs", async () => {
    const res = await adminStatsGET(req("/api/admin/stats", { token: studentToken }));
    expect(res.status).toBe(403);
  });

  it("invalidates the session after logout", async () => {
    const res = await logoutPOST(req("/api/auth/logout", { method: "POST", token: studentToken }));
    expect(res.status).toBe(204);
    const me = await meGET(req("/api/auth/me", { token: studentToken }));
    expect(me.status).toBe(401);
    // log back in for the remaining tests
    studentToken = await login(STUDENT.email, STUDENT.password);
  });
});

describe("public content", () => {
  it("serves the published library with filters", async () => {
    const all = await wordPartsGET(req("/api/word-parts"));
    expect(all.status).toBe(200);
    const allBody = await all.json();
    expect(allBody.total).toBe(130);

    const prefixes = await wordPartsGET(req("/api/word-parts?type=prefix"));
    expect((await prefixes.json()).total).toBe(40);

    const search = await wordPartsGET(req("/api/word-parts?search=bene"));
    const searchBody = await search.json();
    expect(searchBody.total).toBeGreaterThanOrEqual(1);
    expect(
      searchBody.parts.some((p: WordPart) => p.text.includes("bene"))
    ).toBe(true);
  });
});

describe("study and spaced repetition", () => {
  it("records reviews and updates progress", async () => {
    const res = await reviewPOST(
      req("/api/study/review", {
        body: { wordPartId: partId, rating: "good" },
        token: studentToken,
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.progress.status).toBe("learning");
    expect(body.progress.correct_count).toBe(1);
    expect(body.xp).toBeGreaterThanOrEqual(5);

    const again = await reviewPOST(
      req("/api/study/review", {
        body: { wordPartId: partId, rating: "again" },
        token: studentToken,
      })
    );
    const againBody = await again.json();
    expect(againBody.progress.streak).toBe(0);
    expect(againBody.progress.incorrect_count).toBe(1);
  });

  it("rejects reviews for unpublished parts", async () => {
    const res = await reviewPOST(
      req("/api/study/review", {
        body: { wordPartId: "does-not-exist", rating: "good" },
        token: studentToken,
      })
    );
    expect(res.status).toBe(404);
  });

  it("serves study items for every scope with parts, words, and progress", async () => {
    for (const scope of ["due", "new", "mistakes", "all"] as const) {
      const res = await studyItemsGET(
        req(`/api/study/items?scope=${scope}&limit=5`, { token: studentToken })
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scope).toBe(scope);
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBeGreaterThan(0);
      expect(body.items[0].part.id).toBeTruthy();
      expect(body.items[0].part.text).toBeTruthy();
      expect(body.items[0].part.meaning).toBeTruthy();
      expect(Array.isArray(body.items[0].words)).toBe(true);
    }

    // The part reviewed above (rated "again") appears in mistakes and carries progress.
    const all = await studyItemsGET(
      req("/api/study/items?scope=all&limit=200", { token: studentToken })
    );
    const allBody = await all.json();
    const reviewed = allBody.items.find(
      (item: { part: { id: string } }) => item.part.id === partId
    );
    expect(reviewed).toBeTruthy();
    expect(reviewed.progress).toBeTruthy();
    expect(reviewed.progress.incorrect_count).toBe(1);

    const mistakes = await studyItemsGET(
      req("/api/study/items?scope=mistakes&limit=200", { token: studentToken })
    );
    const mistakesBody = await mistakes.json();
    expect(
      mistakesBody.items.some(
        (item: { part: { id: string } }) => item.part.id === partId
      )
    ).toBe(true);
  });
});

describe("quiz flow", () => {
  it("starts a quiz without leaking correct answers", async () => {
    const res = await quizStartPOST(
      req("/api/quiz/start", {
        body: { mode: "mixed", count: 5 },
        token: studentToken,
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.questions.length).toBe(5);
    attemptId = body.attempt.id;
    for (const q of body.questions) {
      expect(q.options.length).toBe(4);
      expect(q.options.some((o: { isCorrect?: boolean }) => "isCorrect" in o)).toBe(
        false
      );
    }
  });

  it("accepts answers and returns feedback", async () => {
    const start = await quizStartPOST(
      req("/api/quiz/start", {
        body: { mode: "mixed", count: 5 },
        token: studentToken,
      })
    );
    const { attempt, questions } = await start.json();
    attemptId = attempt.id;

    for (const q of questions) {
      // Answer correctly by looking up the answer key server-side (test only).
      const correct = db.get<QuestionOption>(
        "SELECT id FROM question_options WHERE question_id = ? AND is_correct = 1",
        q.id
      )!;
      const res = await quizAnswerPOST(
        req(`/api/quiz/${attempt.id}/answer`, {
          body: { questionId: q.id, optionId: correct.id, timeMs: 1200 },
          token: studentToken,
        }),
        { params: { attemptId: attempt.id } }
      );
      expect(res.status).toBe(200);
      const feedback = await res.json();
      expect(feedback.isCorrect).toBe(true);
      expect(feedback.explanation).toBeTruthy();
    }

    const finish = await quizFinishPOST(
      req(`/api/quiz/${attempt.id}/finish`, { method: "POST", token: studentToken }),
      { params: { attemptId: attempt.id } }
    );
    expect(finish.status).toBe(200);
    const summary = await finish.json();
    expect(summary.score).toBe(5);
    expect(summary.total).toBe(5);
    expect(summary.accuracy).toBe(1);
    expect(summary.xp).toBeGreaterThanOrEqual(75);
  });

  it("returns full results with explanations", async () => {
    const res = await quizResultsGET(
      req(`/api/quiz/${attemptId}/results`, { token: studentToken }),
      { params: { attemptId } }
    );
    expect(res.status).toBe(200);
    const results = await res.json();
    expect(results.questions.length).toBe(5);
    expect(results.questions[0].options.length).toBe(4);
    expect(results.questions[0].explanation).toBeTruthy();
    expect(results.score).toBe(5);
  });

  it("updates the dashboard after studying", async () => {
    const res = await dashboardGET(req("/api/dashboard", { token: studentToken }));
    expect(res.status).toBe(200);
    const dash = await res.json();
    expect(dash.stats.total_reviews).toBeGreaterThanOrEqual(2);
    expect(dash.stats.quizzes_completed).toBeGreaterThanOrEqual(1);
    expect(dash.profile.email).toBe(STUDENT.email);
  });
});

describe("cross-user isolation", () => {
  it("prevents users from reading each other's quiz results", async () => {
    const register = await registerPOST(req("/api/auth/register", { body: OTHER }));
    expect(register.status).toBe(200);
    otherToken = sessionCookie(register)!;

    const res = await quizResultsGET(
      req(`/api/quiz/${attemptId}/results`, { token: otherToken }),
      { params: { attemptId } }
    );
    expect(res.status).toBe(404);
  });

  it("keeps progress separate per user", async () => {
    await reviewPOST(
      req("/api/study/review", {
        body: { wordPartId: partId, rating: "easy" },
        token: otherToken,
      })
    );
    const row = db.get<{ user_id: string; correct_count: number }>(
      "SELECT user_id, correct_count FROM user_word_progress WHERE word_part_id = ? AND user_id = (SELECT id FROM profiles WHERE email = ?)",
      partId,
      OTHER.email
    );
    expect(row).toBeTruthy();
    expect(row!.correct_count).toBe(1);
  });
});

describe("admin content management", () => {
  let adminToken = "";

  it("lets admins in and keeps students out", async () => {
    adminToken = await login("admin@rootquest.app", "Admin1234!");
    const stats = await adminStatsGET(req("/api/admin/stats", { token: adminToken }));
    expect(stats.status).toBe(200);
    const body = await stats.json();
    expect(body.wordParts).toBe(130);
  });

  it("creates drafts that stay hidden from students until published", async () => {
    const before = await (await wordPartsGET(req("/api/word-parts"))).json();
    const created = await adminWordPartPOST(
      req("/api/admin/word-parts", {
        body: {
          text: "test-",
          type: "prefix",
          meaning: "for testing",
          difficulty: "beginner",
          category: "test",
        },
        token: adminToken,
      })
    );
    expect(created.status).toBe(201);
    const { part } = await created.json();
    expect(part.status).toBe("draft");

    const during = await (await wordPartsGET(req("/api/word-parts"))).json();
    expect(during.total).toBe(before.total); // drafts are hidden

    const published = await adminWordPartPATCH(
      req(`/api/admin/word-parts/${part.id}`, {
        body: { status: "published" },
        token: adminToken,
      }),
      { params: { id: part.id } }
    );
    expect(published.status).toBe(200);
    const after = await (await wordPartsGET(req("/api/word-parts"))).json();
    expect(after.total).toBe(before.total + 1);
  });

  it("rejects invalid questions that cannot be published", async () => {
    const res = await adminQuestionPOST(
      req("/api/admin/questions", {
        body: {
          type: "meaning",
          prompt: "What does test- mean?",
          difficulty: "beginner",
          explanation: "Because it is a test.",
          status: "published",
          options: [
            { text: "for testing", isCorrect: true },
            { text: "also correct", isCorrect: true },
            { text: "wrong", isCorrect: false },
            { text: "also wrong", isCorrect: false },
          ],
        },
        token: adminToken,
      })
    );
    expect(res.status).toBe(400);
  });

  it("accepts valid draft questions", async () => {
    const res = await adminQuestionPOST(
      req("/api/admin/questions", {
        body: {
          type: "meaning",
          prompt: "What does test- mean?",
          difficulty: "beginner",
          explanation: "It means for testing.",
          status: "draft",
          options: [
            { text: "for testing", isCorrect: true },
            { text: "before", isCorrect: false },
            { text: "after", isCorrect: false },
            { text: "against", isCorrect: false },
          ],
        },
        token: adminToken,
      })
    );
    expect(res.status).toBe(201);
  });

  it("writes an audit trail for administrative actions", async () => {
    const res = await adminAuditLogGET(
      req("/api/admin/audit-log?limit=10", { token: adminToken })
    );
    expect(res.status).toBe(200);
    const { entries } = await res.json();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e: { action: string }) => e.action === "word_part.create")).toBe(true);
    expect(entries.some((e: { action: string }) => e.action === "word_part.published")).toBe(true);
  });
});

describe("password reset flow", () => {
  it("issues a reset token in development and resets the password", async () => {
    const { POST: forgotPOST } = await import("@/app/api/auth/forgot-password/route");
    const { POST: resetPOST } = await import("@/app/api/auth/reset-password/route");

    const forgot = await forgotPOST(
      req("/api/auth/forgot-password", { body: { email: STUDENT.email } })
    );
    expect(forgot.status).toBe(200);
    const { devResetToken } = await forgot.json();
    expect(devResetToken).toBeTruthy();

    const reset = await resetPOST(
      req("/api/auth/reset-password", {
        body: { token: devResetToken, password: "NewPassword1!" },
      })
    );
    expect(reset.status).toBe(200);

    // Old password no longer works, new one does.
    const oldLogin = await loginPOST(
      req("/api/auth/login", {
        body: { email: STUDENT.email, password: STUDENT.password },
      })
    );
    expect(oldLogin.status).toBe(401);
    const newLogin = await loginPOST(
      req("/api/auth/login", {
        body: { email: STUDENT.email, password: "NewPassword1!" },
      })
    );
    expect(newLogin.status).toBe(200);
  });
});
