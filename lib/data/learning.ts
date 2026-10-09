import { db, withTransaction } from "@/lib/db";
import { ApiError } from "@/lib/auth/guards";
import { evaluateAchievements, recordActivity } from "@/lib/gamification";
import {
  applyReview,
  describeDueReason,
  type ProgressSnapshot,
} from "@/lib/srs/algorithm";
import { scoreQuiz, xpForQuiz } from "@/lib/quiz/scoring";
import { nowIso, uid } from "@/lib/utils";
import { sampleQuestions } from "./library";
import type {
  Profile,
  Question,
  QuestionOption,
  QuizAnswer,
  QuizAttempt,
  ReviewRating,
  StudySession,
  UserWordProgress,
  Word,
  WordPart,
} from "@/types";

/**
 * Learning engine: study sessions, spaced-repetition reviews, and quizzes.
 * Every function enforces ownership server-side.
 */

export interface StudyItem {
  part: WordPart;
  words: Word[];
  progress: UserWordProgress | null;
  dueReason: string;
}

function progressFromRow(row: UserWordProgress | undefined): UserWordProgress | null {
  return row ?? null;
}

function snapshotFromProgress(
  row: UserWordProgress | null
): ProgressSnapshot {
  if (!row) {
    return {
      status: "new",
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
      easeFactor: 2.5,
      intervalMinutes: 0,
      lastRating: null,
      lastReviewedAt: null,
      nextReviewAt: null,
    };
  }
  return {
    status: row.status,
    correctCount: row.correct_count,
    incorrectCount: row.incorrect_count,
    streak: row.streak,
    easeFactor: row.ease_factor,
    intervalMinutes: row.interval_minutes,
    lastRating: row.last_rating,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewAt: row.next_review_at,
  };
}

// ------------------------------------------------------------ study items --

type Scope = "due" | "new" | "mistakes" | "all";

function rowsToItems(
  rows: { part: WordPart; progress: UserWordProgress | null }[]
): StudyItem[] {
  return rows.map(({ part, progress }) => ({
    part,
    words: db.all<Word>(
      "SELECT * FROM words WHERE word_part_id = ? AND status = 'published' ORDER BY word",
      part.id
    ),
    progress: progressFromRow(progress ?? undefined),
    dueReason: describeDueReason(snapshotFromProgress(progress ?? null)),
  }));
}

const STUDY_SELECT = `
  SELECT
    w.id AS part_id, w.text AS part_text, w.type AS part_type,
    w.meaning AS part_meaning, w.description AS part_description,
    w.origin AS part_origin, w.difficulty AS part_difficulty,
    w.category AS part_category, w.visual_mnemonic AS part_visual_mnemonic,
    w.related_parts AS part_related_parts, w.status AS part_status,
    w.created_by AS part_created_by, w.created_at AS part_created_at,
    w.updated_at AS part_updated_at,
    p.user_id AS progress_user_id, p.word_part_id AS progress_word_part_id,
    p.status AS progress_status, p.correct_count AS progress_correct_count,
    p.incorrect_count AS progress_incorrect_count, p.streak AS progress_streak,
    p.ease_factor AS progress_ease_factor,
    p.interval_minutes AS progress_interval_minutes,
    p.last_rating AS progress_last_rating,
    p.last_reviewed_at AS progress_last_reviewed_at,
    p.next_review_at AS progress_next_review_at
`;

export function getStudyItems(
  userId: string,
  scope: Scope,
  limit = 50
): StudyItem[] {
  const now = nowIso();
  const capped = Math.min(Math.max(limit, 1), 200);
  if (scope === "all") {
    const rows = db.all<Record<string, unknown>>(
      `${STUDY_SELECT}
       FROM word_parts w
       LEFT JOIN user_word_progress p ON p.word_part_id = w.id AND p.user_id = ?
       WHERE w.status = 'published'
       ORDER BY w.type, w.category, w.text
       LIMIT ?`,
      userId,
      capped
    );
    return rowsToItems(rows.map((r) => splitStudyRow(r)));
  }
  if (scope === "new") {
    const rows = db.all<Record<string, unknown>>(
      `${STUDY_SELECT}
       FROM word_parts w
       LEFT JOIN user_word_progress p ON p.word_part_id = w.id AND p.user_id = ?
       WHERE w.status = 'published' AND p.user_id IS NULL
       ORDER BY w.type, w.category, w.text
       LIMIT ?`,
      userId,
      capped
    );
    return rowsToItems(rows.map((r) => splitStudyRow(r)));
  }
  if (scope === "mistakes") {
    const rows = db.all<Record<string, unknown>>(
      `${STUDY_SELECT}
       FROM word_parts w
       JOIN user_word_progress p ON p.word_part_id = w.id AND p.user_id = ?
       WHERE w.status = 'published' AND (p.incorrect_count > 0 OR p.last_rating = 'again')
       ORDER BY p.incorrect_count DESC, p.next_review_at ASC
       LIMIT ?`,
      userId,
      capped
    );
    return rowsToItems(rows.map((r) => splitStudyRow(r)));
  }
  // due: never reviewed, or scheduled review time has arrived
  const rows = db.all<Record<string, unknown>>(
    `${STUDY_SELECT}
     FROM word_parts w
     LEFT JOIN user_word_progress p ON p.word_part_id = w.id AND p.user_id = ?
     WHERE w.status = 'published'
       AND (p.user_id IS NULL OR p.next_review_at IS NULL OR p.next_review_at <= ?)
     ORDER BY (p.next_review_at IS NULL) DESC, p.next_review_at ASC, w.text ASC
     LIMIT ?`,
    userId,
    now,
    capped
  );
  return rowsToItems(rows.map((r) => splitStudyRow(r)));
}

/** Split a joined row (part_* / progress_* prefixed columns) into two objects. */
function splitStudyRow(
  row: Record<string, unknown>
): { part: WordPart; progress: UserWordProgress | null } {
  const part: Record<string, unknown> = {};
  const progress: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith("part_")) part[key.slice(5)] = value;
    else if (key.startsWith("progress_")) progress[key.slice(9)] = value;
  }
  const hasProgress = Object.values(progress).some((v) => v !== null);
  return {
    part: part as unknown as WordPart,
    progress: hasProgress ? (progress as unknown as UserWordProgress) : null,
  };
}

export function countDueItems(userId: string): number {
  const now = nowIso();
  return (
    db.get<{ n: number }>(
      `SELECT COUNT(*) AS n
       FROM word_parts w
       LEFT JOIN user_word_progress p ON p.word_part_id = w.id AND p.user_id = ?
       WHERE w.status = 'published'
         AND (p.user_id IS NULL OR p.next_review_at IS NULL OR p.next_review_at <= ?)`,
      userId,
      now
    )?.n ?? 0
  );
}

// --------------------------------------------------------- study sessions --

export function startStudySession(
  userId: string,
  mode: StudySession["mode"]
): StudySession {
  const id = uid();
  db.run(
    "INSERT INTO study_sessions (id, user_id, mode, started_at) VALUES (?, ?, ?, ?)",
    id,
    userId,
    mode,
    nowIso()
  );
  return db.get<StudySession>(
    "SELECT * FROM study_sessions WHERE id = ?",
    id
  )!;
}

export function finishStudySession(userId: string, sessionId: string): void {
  const session = db.get<StudySession>(
    "SELECT * FROM study_sessions WHERE id = ? AND user_id = ?",
    sessionId,
    userId
  );
  if (!session) throw new ApiError(404, "Study session not found.");
  if (!session.ended_at) {
    db.run(
      "UPDATE study_sessions SET ended_at = ? WHERE id = ?",
      nowIso(),
      sessionId
    );
  }
}

function touchSession(userId: string, sessionId: string | null, xp: number): void {
  if (!sessionId) return;
  db.run(
    `UPDATE study_sessions
     SET items_reviewed = items_reviewed + 1, xp_earned = xp_earned + ?
     WHERE id = ? AND user_id = ? AND ended_at IS NULL`,
    xp,
    sessionId,
    userId
  );
}

// ------------------------------------------------------------------ review --

export interface ReviewOutcome {
  progress: UserWordProgress;
  xp: number;
  newAchievements: { id: string; code: string; name: string; xpBonus: number }[];
  leveledUp: boolean;
}

export function recordReview(
  userId: string,
  wordPartId: string,
  rating: ReviewRating,
  sessionId?: string | null
): ReviewOutcome {
  const part = db.get<WordPart>(
    "SELECT id FROM word_parts WHERE id = ? AND status = 'published'",
    wordPartId
  );
  if (!part) throw new ApiError(404, "Word part not found.");

  const profile = db.get<Profile>("SELECT * FROM profiles WHERE id = ?", userId)!;
  const existing = db.get<UserWordProgress>(
    "SELECT * FROM user_word_progress WHERE user_id = ? AND word_part_id = ?",
    userId,
    wordPartId
  );
  const wasMissed = (existing?.incorrect_count ?? 0) > 0;
  const result = applyReview(snapshotFromProgress(existing ?? null), rating);
  const u = result.updates;
  const correct = rating === "good" || rating === "easy";

  withTransaction(() => {
    if (existing) {
      db.run(
        `UPDATE user_word_progress SET
           status = ?, correct_count = ?, incorrect_count = ?, streak = ?,
           ease_factor = ?, interval_minutes = ?, last_rating = ?,
           last_reviewed_at = ?, next_review_at = ?
         WHERE user_id = ? AND word_part_id = ?`,
        u.status,
        u.correctCount,
        u.incorrectCount,
        u.streak,
        u.easeFactor,
        u.intervalMinutes,
        u.lastRating,
        u.lastReviewedAt,
        u.nextReviewAt,
        userId,
        wordPartId
      );
    } else {
      db.run(
        `INSERT INTO user_word_progress
          (user_id, word_part_id, status, correct_count, incorrect_count, streak, ease_factor, interval_minutes, last_rating, last_reviewed_at, next_review_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        userId,
        wordPartId,
        u.status,
        u.correctCount,
        u.incorrectCount,
        u.streak,
        u.easeFactor,
        u.intervalMinutes,
        u.lastRating,
        u.lastReviewedAt,
        u.nextReviewAt
      );
    }
    touchSession(userId, sessionId ?? null, result.xp);
  });

  const stats = recordActivity(userId, profile.timezone, {
    xp: result.xp,
    reviews: 1,
    correct: correct ? 1 : 0,
    incorrect: correct ? 0 : 1,
    mistakesReviewed: wasMissed && correct ? 1 : 0,
  });

  const newAchievements = evaluateAchievements(userId);
  const bonusXp = newAchievements.reduce((sum, a) => sum + a.xp_bonus, 0);

  const progress = db.get<UserWordProgress>(
    "SELECT * FROM user_word_progress WHERE user_id = ? AND word_part_id = ?",
    userId,
    wordPartId
  )!;

  return {
    progress,
    xp: result.xp + bonusXp,
    newAchievements: newAchievements.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      xpBonus: a.xp_bonus,
    })),
    leveledUp: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...(stats ? {} : {}),
  };
}

// -------------------------------------------------------------------- quiz --

export interface QuizStartOptions {
  mode: "mixed" | "category" | "difficulty" | "lesson" | "review";
  category?: string | null;
  difficulty?: "beginner" | "intermediate" | "advanced" | null;
  lessonId?: string | null;
  count: number;
  timed?: boolean;
}

export interface PublicQuestion {
  id: string;
  type: string;
  prompt: string;
  passage: string | null;
  difficulty: string;
  category: string | null;
  options: { id: string; text: string; position: number }[];
}

function sanitizeQuestion(q: Question, options: QuestionOption[]): PublicQuestion {
  return {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    passage: q.passage,
    difficulty: q.difficulty,
    category: q.category,
    options: options
      .map((o) => ({ id: o.id, text: o.text, position: o.position }))
      .sort((a, b) => a.position - b.position),
  };
}

export function startQuizAttempt(
  userId: string,
  options: QuizStartOptions
): { attempt: QuizAttempt; questions: PublicQuestion[] } {
  let questions: Question[] = [];
  if (options.mode === "lesson" && options.lessonId) {
    const partIds = db
      .all<{ word_part_id: string }>(
        "SELECT word_part_id FROM lesson_word_parts WHERE lesson_id = ?",
        options.lessonId
      )
      .map((r) => r.word_part_id);
    if (partIds.length > 0) {
      const placeholders = partIds.map(() => "?").join(", ");
      questions = db.all<Question>(
        `SELECT * FROM questions WHERE status = 'published' AND related_part_id IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`,
        ...partIds,
        options.count
      );
    }
  } else if (options.mode === "review") {
    const weakPartIds = db
      .all<{ word_part_id: string }>(
        `SELECT word_part_id FROM user_word_progress
         WHERE user_id = ? AND (incorrect_count > 0 OR last_rating = 'again')
         ORDER BY incorrect_count DESC LIMIT 40`,
        userId
      )
      .map((r) => r.word_part_id);
    if (weakPartIds.length > 0) {
      const placeholders = weakPartIds.map(() => "?").join(", ");
      questions = db.all<Question>(
        `SELECT * FROM questions WHERE status = 'published' AND related_part_id IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`,
        ...weakPartIds,
        options.count
      );
    }
  }
  if (questions.length < options.count) {
    questions = sampleQuestions({
      type: options.mode === "mixed" ? undefined : undefined,
      difficulty: options.mode === "difficulty" ? options.difficulty ?? undefined : undefined,
      category: options.mode === "category" ? options.category ?? undefined : undefined,
      count: options.count,
    });
  }
  if (questions.length === 0) {
    throw new ApiError(400, "No published questions are available for this quiz.");
  }

  const attemptId = uid();
  const questionIds = questions.map((q) => q.id);
  db.run(
    `INSERT INTO quiz_attempts
      (id, user_id, mode, difficulty, question_count, question_ids, started_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    attemptId,
    userId,
    options.mode,
    options.difficulty ?? null,
    questions.length,
    JSON.stringify(questionIds),
    nowIso()
  );

  const attempt = db.get<QuizAttempt>(
    "SELECT * FROM quiz_attempts WHERE id = ?",
    attemptId
  )!;
  const publicQuestions = questions.map((q) =>
    sanitizeQuestion(
      q,
      db.all<QuestionOption>(
        "SELECT * FROM question_options WHERE question_id = ? ORDER BY position",
        q.id
      )
    )
  );
  return { attempt, questions: publicQuestions };
}

function getOwnedAttempt(userId: string, attemptId: string): QuizAttempt {
  const attempt = db.get<QuizAttempt>(
    "SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?",
    attemptId,
    userId
  );
  if (!attempt) throw new ApiError(404, "Quiz attempt not found.");
  return attempt;
}

export interface AnswerFeedback {
  isCorrect: boolean;
  correctOptionId: string;
  selectedOptionId: string;
  explanation: string | null;
  prompt: string;
}

export function submitQuizAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  optionId: string,
  timeMs?: number | null
): AnswerFeedback {
  const attempt = getOwnedAttempt(userId, attemptId);
  if (attempt.completed_at) {
    throw new ApiError(400, "This quiz attempt is already complete.");
  }
  let questionIds: string[] = [];
  try {
    questionIds = JSON.parse(attempt.question_ids);
  } catch {
    questionIds = [];
  }
  if (!questionIds.includes(questionId)) {
    throw new ApiError(400, "That question is not part of this quiz attempt.");
  }
  const already = db.get<QuizAnswer>(
    "SELECT id FROM quiz_answers WHERE attempt_id = ? AND question_id = ?",
    attemptId,
    questionId
  );
  if (already) {
    throw new ApiError(400, "You already answered this question.");
  }
  const question = db.get<Question>(
    "SELECT * FROM questions WHERE id = ? AND status = 'published'",
    questionId
  );
  if (!question) throw new ApiError(404, "Question not found.");
  const options = db.all<QuestionOption>(
    "SELECT * FROM question_options WHERE question_id = ?",
    questionId
  );
  const selected = options.find((o) => o.id === optionId);
  if (!selected) {
    throw new ApiError(400, "That answer option is not valid for this question.");
  }
  const correctOption = options.find((o) => o.is_correct === 1)!;
  const isCorrect = selected.is_correct === 1;

  withTransaction(() => {
    db.run(
      `INSERT INTO quiz_answers (id, attempt_id, question_id, selected_option_id, is_correct, time_ms)
       VALUES (?, ?, ?, ?, ?, ?)`,
      uid(),
      attemptId,
      questionId,
      optionId,
      isCorrect,
      timeMs ?? null
    );

    // Update word-part progress: mistakes go straight to the review queue.
    if (question.related_part_id) {
      const progress = db.get<UserWordProgress>(
        "SELECT * FROM user_word_progress WHERE user_id = ? AND word_part_id = ?",
        userId,
        question.related_part_id
      );
      if (isCorrect) {
        if (progress) {
          db.run(
            "UPDATE user_word_progress SET correct_count = correct_count + 1 WHERE user_id = ? AND word_part_id = ?",
            userId,
            question.related_part_id
          );
        } else {
          db.run(
            `INSERT INTO user_word_progress
              (user_id, word_part_id, status, correct_count, incorrect_count, streak, ease_factor, interval_minutes)
             VALUES (?, ?, 'learning', 1, 0, 0, 2.5, 0)`,
            userId,
            question.related_part_id
          );
        }
      } else if (progress) {
        const streak = Math.max(0, progress.streak - 1);
        const status =
          streak <= 0
            ? progress.correct_count > 0
              ? "learning"
              : "new"
            : streak <= 2
              ? "learning"
              : streak <= 4
                ? "familiar"
                : streak <= 7
                  ? "strong"
                  : "mastered";
        db.run(
          `UPDATE user_word_progress
           SET incorrect_count = incorrect_count + 1, streak = ?, status = ?,
               last_rating = 'again', last_reviewed_at = ?, next_review_at = ?
           WHERE user_id = ? AND word_part_id = ?`,
          streak,
          status,
          nowIso(),
          nowIso(),
          userId,
          question.related_part_id
        );
      } else {
        db.run(
          `INSERT INTO user_word_progress
            (user_id, word_part_id, status, correct_count, incorrect_count, streak, ease_factor, interval_minutes, last_rating, last_reviewed_at, next_review_at)
           VALUES (?, ?, 'learning', 0, 1, 0, 2.5, 0, 'again', ?, ?)`,
          userId,
          question.related_part_id,
          nowIso(),
          nowIso()
        );
      }
    }
  });

  return {
    isCorrect,
    correctOptionId: correctOption.id,
    selectedOptionId: optionId,
    explanation: question.explanation,
    prompt: question.prompt,
  };
}

export interface QuizResults {
  attempt: QuizAttempt;
  questions: (Question & {
    options: QuestionOption[];
    selectedOptionId: string | null;
    isCorrect: boolean;
    timeMs: number | null;
  })[];
  score: number;
  total: number;
  accuracy: number;
  xp: number;
  newAchievements: { id: string; code: string; name: string; xpBonus: number }[];
  durationSeconds: number;
}

export function finishQuizAttempt(userId: string, attemptId: string): QuizResults {
  const attempt = getOwnedAttempt(userId, attemptId);
  const profile = db.get<Profile>("SELECT * FROM profiles WHERE id = ?", userId)!;

  const answers = db.all<QuizAnswer>(
    "SELECT * FROM quiz_answers WHERE attempt_id = ?",
    attemptId
  );

  const { score, total, accuracy } = scoreQuiz(
    answers.map((a) => ({ isCorrect: a.is_correct === 1, timeMs: a.time_ms }))
  );
  const xp = xpForQuiz(score, total);
  const durationSeconds = Math.max(
    0,
    Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000)
  );

  let questionIds: string[] = [];
  try {
    questionIds = JSON.parse(attempt.question_ids);
  } catch {
    questionIds = [];
  }

  // Count correct context questions for the Context Master achievement.
  let contextCorrect = 0;
  if (questionIds.length > 0) {
    const placeholders = questionIds.map(() => "?").join(", ");
    const rows = db.all<{ type: string; id: string }>(
      `SELECT id, type FROM questions WHERE id IN (${placeholders})`,
      ...questionIds
    );
    const typeById = new Map(rows.map((r) => [r.id, r.type]));
    contextCorrect = answers.filter(
      (a) => a.is_correct === 1 && typeById.get(a.question_id) === "context"
    ).length;
  }

  withTransaction(() => {
    db.run(
      `UPDATE quiz_attempts
       SET score = ?, total = ?, duration_seconds = ?, completed_at = ?
       WHERE id = ? AND user_id = ?`,
      score,
      total,
      durationSeconds,
      nowIso(),
      attemptId,
      userId
    );
  });

  recordActivity(userId, profile.timezone, {
    xp,
    correct: score,
    incorrect: total - score,
    contextCorrect,
  });
  db.run(
    "UPDATE user_stats SET quizzes_completed = quizzes_completed + 1 WHERE user_id = ?",
    userId
  );

  const newAchievements = evaluateAchievements(userId);
  const bonusXp = newAchievements.reduce((sum, a) => sum + a.xp_bonus, 0);

  return getQuizResults(userId, attemptId, {
    xp: xp + bonusXp,
    newAchievements: newAchievements.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      xpBonus: a.xp_bonus,
    })),
  });
}

export function getQuizResults(
  userId: string,
  attemptId: string,
  extra?: { xp?: number; newAchievements?: QuizResults["newAchievements"] }
): QuizResults {
  const attempt = getOwnedAttempt(userId, attemptId);
  const answers = db.all<QuizAnswer>(
    "SELECT * FROM quiz_answers WHERE attempt_id = ?",
    attemptId
  );
  const answerByQuestion = new Map(answers.map((a) => [a.question_id, a]));

  let questionIds: string[] = [];
  try {
    questionIds = JSON.parse(attempt.question_ids);
  } catch {
    questionIds = [];
  }
  const questions: QuizResults["questions"] = [];
  for (const qid of questionIds) {
    const question = db.get<Question>(
      "SELECT * FROM questions WHERE id = ?",
      qid
    );
    if (!question) continue;
    const options = db.all<QuestionOption>(
      "SELECT * FROM question_options WHERE question_id = ? ORDER BY position",
      qid
    );
    const answer = answerByQuestion.get(qid);
    questions.push({
      ...question,
      options,
      selectedOptionId: answer?.selected_option_id ?? null,
      isCorrect: answer ? answer.is_correct === 1 : false,
      timeMs: answer?.time_ms ?? null,
    });
  }

  const { score, total, accuracy } = scoreQuiz(
    answers.map((a) => ({ isCorrect: a.is_correct === 1, timeMs: a.time_ms }))
  );
  return {
    attempt,
    questions,
    score,
    total: attempt.total || total,
    accuracy,
    xp: extra?.xp ?? 0,
    newAchievements: extra?.newAchievements ?? [],
    durationSeconds: attempt.duration_seconds ?? 0,
  };
}
