import { db } from "@/lib/db";
import type { Lesson, Question, QuestionOption, Word, WordPart } from "@/types";

/**
 * Read-only content queries. Students only ever see published content;
 * drafts and archived items are filtered out here at the data layer.
 */

export interface WordPartFilters {
  search?: string;
  type?: "prefix" | "root" | "suffix";
  difficulty?: "beginner" | "intermediate" | "advanced";
  category?: string;
  limit?: number;
  offset?: number;
}

export function listPublishedWordParts(filters: WordPartFilters = {}) {
  const conditions = ["status = 'published'"];
  const params: unknown[] = [];
  if (filters.search) {
    conditions.push("(text LIKE ? OR meaning LIKE ? OR description LIKE ?)");
    const like = `%${filters.search}%`;
    params.push(like, like, like);
  }
  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }
  if (filters.difficulty) {
    conditions.push("difficulty = ?");
    params.push(filters.difficulty);
  }
  if (filters.category) {
    conditions.push("category = ?");
    params.push(filters.category);
  }
  const where = conditions.join(" AND ");
  const limit = Math.min(Math.max(filters.limit ?? 200, 1), 500);
  const offset = Math.max(filters.offset ?? 0, 0);
  const parts = db.all<WordPart>(
    `SELECT * FROM word_parts WHERE ${where} ORDER BY type, category, text LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset
  );
  const total =
    db.get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM word_parts WHERE ${where}`,
      ...params
    )?.n ?? 0;
  return { parts, total };
}

export function getPublishedWordPart(id: string): WordPart | null {
  const part = db.get<WordPart>(
    "SELECT * FROM word_parts WHERE id = ? AND status = 'published'",
    id
  );
  return part ?? null;
}

export function getWordsForPart(partId: string): Word[] {
  return db.all<Word>(
    "SELECT * FROM words WHERE word_part_id = ? AND status = 'published' ORDER BY word",
    partId
  );
}

export function listPublishedLessons(): Lesson[] {
  return db.all<Lesson>(
    "SELECT * FROM lessons WHERE status = 'published' ORDER BY order_index, title"
  );
}

export function getPublishedLesson(id: string): Lesson | null {
  return (
    db.get<Lesson>(
      "SELECT * FROM lessons WHERE id = ? AND status = 'published'",
      id
    ) ?? null
  );
}

export function getLessonParts(lessonId: string): WordPart[] {
  return db.all<WordPart>(
    `SELECT w.* FROM word_parts w
     JOIN lesson_word_parts l ON l.word_part_id = w.id
     WHERE l.lesson_id = ? AND w.status = 'published'
     ORDER BY l.position`,
    lessonId
  );
}

/** Resolve a part's stored related-parts list (JSON array of part texts). */
export function getRelatedParts(part: WordPart): WordPart[] {
  let texts: string[] = [];
  try {
    const raw = (part as WordPart & { related_parts?: string }).related_parts;
    texts = raw ? JSON.parse(raw) : [];
  } catch {
    texts = [];
  }
  if (texts.length === 0) return [];
  const placeholders = texts.map(() => "?").join(", ");
  return db.all<WordPart>(
    `SELECT * FROM word_parts WHERE status = 'published' AND text IN (${placeholders})`,
    ...texts
  );
}

export function getCategories(): string[] {
  const rows = db.all<{ category: string }>(
    "SELECT DISTINCT category FROM word_parts WHERE status = 'published' AND category IS NOT NULL ORDER BY category"
  );
  return rows.map((r) => r.category);
}

// ------------------------------------------------------------- questions --

export interface QuestionFilters {
  type?: string;
  difficulty?: string;
  category?: string;
  partId?: string;
  limit?: number;
}

export function getPublishedQuestions(filters: QuestionFilters = {}): Question[] {
  const conditions = ["q.status = 'published'"];
  const params: unknown[] = [];
  if (filters.type) {
    conditions.push("q.type = ?");
    params.push(filters.type);
  }
  if (filters.difficulty) {
    conditions.push("q.difficulty = ?");
    params.push(filters.difficulty);
  }
  if (filters.category) {
    conditions.push("q.category = ?");
    params.push(filters.category);
  }
  if (filters.partId) {
    conditions.push("q.related_part_id = ?");
    params.push(filters.partId);
  }
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);
  return db.all<Question>(
    `SELECT q.* FROM questions q WHERE ${conditions.join(" AND ")} ORDER BY q.created_at LIMIT ?`,
    ...params,
    limit
  );
}

export function getQuestionOptions(questionId: string): QuestionOption[] {
  return db.all<QuestionOption>(
    "SELECT * FROM question_options WHERE question_id = ? ORDER BY position",
    questionId
  );
}

export function getQuestionWithOptions(
  questionId: string
): (Question & { options: QuestionOption[] }) | null {
  const question = db.get<Question>(
    "SELECT * FROM questions WHERE id = ? AND status = 'published'",
    questionId
  );
  if (!question) return null;
  return { ...question, options: getQuestionOptions(questionId) };
}

/** Sample N random published questions matching the filters. */
export function sampleQuestions(
  filters: QuestionFilters & { count: number }
): Question[] {
  const conditions = ["status = 'published'"];
  const params: unknown[] = [];
  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }
  if (filters.difficulty) {
    conditions.push("difficulty = ?");
    params.push(filters.difficulty);
  }
  if (filters.category) {
    conditions.push("category = ?");
    params.push(filters.category);
  }
  if (filters.partId) {
    conditions.push("related_part_id = ?");
    params.push(filters.partId);
  }
  const where = conditions.join(" AND ");
  return db.all<Question>(
    `SELECT * FROM questions WHERE ${where} ORDER BY RANDOM() LIMIT ?`,
    ...params,
    Math.min(Math.max(filters.count, 1), 100)
  );
}
