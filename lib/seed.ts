/**
 * Database seeding: initial content library + achievements + default users.
 * Shared by `npm run seed` and the test suite.
 */
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { nowIso, uid } from "@/lib/utils";
import {
  ACHIEVEMENTS,
  ALL_WORD_PARTS,
  LESSONS,
  PART_COUNTS,
} from "@/lib/content";
import { generateQuestions } from "@/lib/content/questions";

export interface SeedOptions {
  /** Create the default admin/student demo accounts. */
  includeUsers?: boolean;
}

export interface SeedSummary {
  wordParts: number;
  prefixes: number;
  roots: number;
  suffixes: number;
  words: number;
  questions: number;
  lessons: number;
  achievements: number;
}

export async function seedDatabase(options: SeedOptions = {}): Promise<SeedSummary> {
  // Start from a clean slate so `npm run seed` is safe to re-run.
  // (PRAGMA foreign_keys is a no-op inside a transaction, so this runs
  // outside one, in child-before-parent order.)
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM admin_audit_log;
    DELETE FROM quiz_answers;
    DELETE FROM quiz_attempts;
    DELETE FROM study_sessions;
    DELETE FROM user_word_progress;
    DELETE FROM user_achievements;
    DELETE FROM saved_words;
    DELETE FROM daily_activity;
    DELETE FROM user_stats;
    DELETE FROM sessions;
    DELETE FROM password_reset_tokens;
    DELETE FROM email_verification_tokens;
    DELETE FROM feedback;
    DELETE FROM lesson_word_parts;
    DELETE FROM lessons;
    DELETE FROM question_options;
    DELETE FROM questions;
    DELETE FROM words;
    DELETE FROM word_parts;
    DELETE FROM achievements;
    DELETE FROM profiles;
    PRAGMA foreign_keys = ON;
  `);

  // ---------------------------------------------------------- word parts --
  const partIdByText = new Map<string, string>();
  for (const part of ALL_WORD_PARTS) {
    const id = uid();
    partIdByText.set(part.text, id);
    db.run(
      `INSERT INTO word_parts
        (id, text, type, meaning, description, origin, difficulty, category, visual_mnemonic, related_parts, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NULL, ?, ?)`,
      id,
      part.text,
      part.type,
      part.meaning,
      part.description,
      part.origin,
      part.difficulty,
      part.category,
      part.mnemonic,
      JSON.stringify(part.related),
      nowIso(),
      nowIso()
    );
    for (const word of part.words) {
      db.run(
        `INSERT INTO words
          (id, word_part_id, word, definition, sentence, pronunciation, difficulty, status)
         VALUES (?, ?, ?, ?, ?, NULL, ?, 'published')`,
        uid(),
        id,
        word.word,
        word.definition,
        word.sentence,
        word.difficulty ?? part.difficulty
      );
    }
  }

  // ------------------------------------------------------------- lessons --
  for (const lesson of LESSONS) {
    const lessonId = uid();
    db.run(
      `INSERT INTO lessons
        (id, title, description, category, difficulty, status, order_index, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?)`,
      lessonId,
      lesson.title,
      lesson.description,
      lesson.category,
      lesson.difficulty,
      lesson.orderIndex,
      nowIso(),
      nowIso()
    );
    lesson.parts.forEach((partText, index) => {
      const partId = partIdByText.get(partText);
      if (!partId) {
        throw new Error(
          `Lesson "${lesson.title}" references unknown part "${partText}"`
        );
      }
      db.run(
        "INSERT INTO lesson_word_parts (lesson_id, word_part_id, position) VALUES (?, ?, ?)",
        lessonId,
        partId,
        index
      );
    });
  }

  // ---------------------------------------------------------- questions --
  const questions = generateQuestions(ALL_WORD_PARTS);
  for (const q of questions) {
    const questionId = q.id;
    const partId = q.relatedPartText
      ? partIdByText.get(q.relatedPartText) ?? null
      : null;
    db.run(
      `INSERT INTO questions
        (id, type, prompt, passage, related_part_id, difficulty, category, explanation, status, author, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)`,
      questionId,
      q.type,
      q.prompt,
      q.passage,
      partId,
      q.difficulty,
      q.category,
      q.explanation,
      q.author,
      nowIso(),
      nowIso()
    );
    q.options.forEach((option, index) => {
      db.run(
        "INSERT INTO question_options (id, question_id, text, is_correct, position) VALUES (?, ?, ?, ?, ?)",
        uid(),
        questionId,
        option.text,
        option.isCorrect,
        index
      );
    });
  }

  // -------------------------------------------------------- achievements --
  for (const achievement of ACHIEVEMENTS) {
    db.run(
      `INSERT INTO achievements (id, code, name, description, icon, xp_bonus, criteria)
       VALUES (?, ?, ?, ?, ?, ?, '{}')`,
      uid(),
      achievement.code,
      achievement.name,
      achievement.description,
      achievement.icon,
      achievement.xpBonus
    );
  }

  // ------------------------------------------------------- default users --
  if (options.includeUsers !== false) {
    const ensureUser = async (
      email: string,
      password: string,
      name: string,
      role: "admin" | "student"
    ) => {
      const existing = db.get<{ id: string }>(
        "SELECT id FROM profiles WHERE email = ?",
        email
      );
      if (existing) return;
      const id = uid();
      db.run(
        `INSERT INTO profiles
          (id, email, password_hash, name, role, daily_goal, sat_date, timezone, email_verified, preferences, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 20, NULL, 'UTC', 1, '{}', ?, ?)`,
        id,
        email,
        await hashPassword(password),
        name,
        role,
        nowIso(),
        nowIso()
      );
      db.run("INSERT INTO user_stats (user_id) VALUES (?)", id);
    };
    await ensureUser("admin@rootquest.app", "Admin1234!", "RootQuest Admin", "admin");
    await ensureUser("student@rootquest.app", "Student1234!", "Demo Student", "student");
  }

  return {
    wordParts: PART_COUNTS.total,
    prefixes: PART_COUNTS.prefixes,
    roots: PART_COUNTS.roots,
    suffixes: PART_COUNTS.suffixes,
    words: db.get<{ n: number }>("SELECT COUNT(*) AS n FROM words")!.n,
    questions: db.get<{ n: number }>("SELECT COUNT(*) AS n FROM questions")!.n,
    lessons: db.get<{ n: number }>("SELECT COUNT(*) AS n FROM lessons")!.n,
    achievements: db.get<{ n: number }>("SELECT COUNT(*) AS n FROM achievements")!.n,
  };
}
