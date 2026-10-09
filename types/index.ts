export type Role = "student" | "teacher" | "admin";

export type PartType = "prefix" | "root" | "suffix";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ContentStatus = "draft" | "published" | "archived";

export type MasteryStatus =
  | "new"
  | "learning"
  | "familiar"
  | "strong"
  | "mastered";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type QuestionType =
  | "meaning"
  | "infer"
  | "example"
  | "context"
  | "compare"
  | "match";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  daily_goal: number;
  sat_date: string | null;
  timezone: string;
  email_verified: number;
  preferences: string;
  created_at: string;
  updated_at: string;
}

/** Profile row including the password hash — server-side only, never sent to clients. */
export interface ProfileWithPassword extends Profile {
  password_hash: string;
}

export interface WordPart {
  id: string;
  text: string;
  type: PartType;
  meaning: string;
  description: string | null;
  origin: string | null;
  difficulty: Difficulty;
  category: string | null;
  visual_mnemonic: string | null;
  status: ContentStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: string;
  word_part_id: string;
  word: string;
  definition: string;
  sentence: string | null;
  pronunciation: string | null;
  difficulty: Difficulty;
  status: ContentStatus;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: Difficulty;
  status: ContentStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  passage: string | null;
  related_part_id: string | null;
  difficulty: Difficulty;
  category: string | null;
  explanation: string | null;
  status: ContentStatus;
  author: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  text: string;
  is_correct: number;
  position: number;
}

export interface UserWordProgress {
  user_id: string;
  word_part_id: string;
  status: MasteryStatus;
  correct_count: number;
  incorrect_count: number;
  streak: number;
  ease_factor: number;
  interval_minutes: number;
  last_rating: ReviewRating | null;
  last_reviewed_at: string | null;
  next_review_at: string | null;
}

export interface StudySession {
  id: string;
  user_id: string;
  mode: "flashcards" | "learn" | "review" | "lesson";
  started_at: string;
  ended_at: string | null;
  items_reviewed: number;
  xp_earned: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  mode: string;
  difficulty: string | null;
  question_count: number;
  score: number;
  total: number;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  /** JSON array of question IDs, in quiz order. */
  question_ids: string;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: number;
  time_ms: number | null;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  xp_bonus: number;
  criteria: string;
}

export interface UserStats {
  user_id: string;
  xp: number;
  total_reviews: number;
  total_correct: number;
  total_incorrect: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  quizzes_completed: number;
  context_correct: number;
  mistakes_reviewed: number;
  words_saved: number;
  study_days: number;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface SavedWord {
  user_id: string;
  word_id: string;
  saved_at: string;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  subject: string | null;
  message: string;
  status: "new" | "reviewed" | "resolved";
  created_at: string;
}

export interface AdminAuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  created_at: string;
}

/** A question together with its options, as served to clients. */
export interface QuestionWithOptions extends Question {
  options: QuestionOption[];
}

/** Question without the correct-answer flag (safe to send to quiz takers). */
export type PublicQuestionOption = Omit<QuestionOption, "is_correct">;
export type PublicQuestion = Omit<Question, never> & {
  options: PublicQuestionOption[];
};
