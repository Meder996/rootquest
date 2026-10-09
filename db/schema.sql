-- RootQuest SAT — database schema (SQLite).
-- Mirrors the PRD's relational design: profiles, word_parts, words, lessons,
-- lesson_word_parts, questions, question_options, user_word_progress,
-- study_sessions, quiz_attempts, quiz_answers, achievements, user_achievements,
-- plus sessions, tokens, saved_words, feedback, admin_audit_log and user_stats.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- profiles --
CREATE TABLE IF NOT EXISTS profiles (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  daily_goal      INTEGER NOT NULL DEFAULT 20,
  sat_date        TEXT,
  timezone        TEXT NOT NULL DEFAULT 'UTC',
  email_verified  INTEGER NOT NULL DEFAULT 0,
  preferences     TEXT NOT NULL DEFAULT '{}',
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ---------------------------------------------------------------- sessions --
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  revoked_at  TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ------------------------------------------------------- password resets --
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- ---------------------------------------------------- email verification --
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);

-- ------------------------------------------------------------- word_parts --
CREATE TABLE IF NOT EXISTS word_parts (
  id              TEXT PRIMARY KEY,
  text            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('prefix', 'root', 'suffix')),
  meaning         TEXT NOT NULL,
  description     TEXT,
  origin          TEXT,
  difficulty      TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category        TEXT,
  visual_mnemonic TEXT,
  related_parts   TEXT NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by      TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_word_parts_status ON word_parts(status);
CREATE INDEX IF NOT EXISTS idx_word_parts_type ON word_parts(type);
CREATE INDEX IF NOT EXISTS idx_word_parts_category ON word_parts(category);
CREATE INDEX IF NOT EXISTS idx_word_parts_difficulty ON word_parts(difficulty);

-- ------------------------------------------------------------------ words --
CREATE TABLE IF NOT EXISTS words (
  id            TEXT PRIMARY KEY,
  word_part_id  TEXT NOT NULL REFERENCES word_parts(id) ON DELETE CASCADE,
  word          TEXT NOT NULL,
  definition    TEXT NOT NULL,
  sentence      TEXT,
  pronunciation TEXT,
  difficulty    TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);
CREATE INDEX IF NOT EXISTS idx_words_part ON words(word_part_id);
CREATE INDEX IF NOT EXISTS idx_words_status ON words(status);
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);

-- ---------------------------------------------------------------- lessons --
CREATE TABLE IF NOT EXISTS lessons (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  difficulty  TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);

CREATE TABLE IF NOT EXISTS lesson_word_parts (
  lesson_id    TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  word_part_id TEXT NOT NULL REFERENCES word_parts(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (lesson_id, word_part_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_word_parts_part ON lesson_word_parts(word_part_id);

-- -------------------------------------------------------------- questions --
CREATE TABLE IF NOT EXISTS questions (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL CHECK (type IN ('meaning', 'infer', 'example', 'context', 'compare', 'match')),
  prompt          TEXT NOT NULL,
  passage         TEXT,
  related_part_id TEXT REFERENCES word_parts(id) ON DELETE SET NULL,
  difficulty      TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category        TEXT,
  explanation     TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author          TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_part ON questions(related_part_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

CREATE TABLE IF NOT EXISTS question_options (
  id          TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  INTEGER NOT NULL DEFAULT 0,
  position    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);

-- ------------------------------------------------------ user_word_progress --
CREATE TABLE IF NOT EXISTS user_word_progress (
  user_id          TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_part_id     TEXT NOT NULL REFERENCES word_parts(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'familiar', 'strong', 'mastered')),
  correct_count    INTEGER NOT NULL DEFAULT 0,
  incorrect_count  INTEGER NOT NULL DEFAULT 0,
  streak           INTEGER NOT NULL DEFAULT 0,
  ease_factor      REAL NOT NULL DEFAULT 2.5,
  interval_minutes INTEGER NOT NULL DEFAULT 0,
  last_rating      TEXT CHECK (last_rating IN ('again', 'hard', 'good', 'easy')),
  last_reviewed_at TEXT,
  next_review_at   TEXT,
  PRIMARY KEY (user_id, word_part_id)
);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_part ON user_word_progress(word_part_id);
CREATE INDEX IF NOT EXISTS idx_progress_due ON user_word_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_progress_status ON user_word_progress(user_id, status);

-- ---------------------------------------------------------- study_sessions --
CREATE TABLE IF NOT EXISTS study_sessions (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode           TEXT NOT NULL CHECK (mode IN ('flashcards', 'learn', 'review', 'lesson')),
  started_at     TEXT NOT NULL,
  ended_at       TEXT,
  items_reviewed INTEGER NOT NULL DEFAULT 0,
  xp_earned      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);

-- ----------------------------------------------------------- quiz_attempts --
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode            TEXT NOT NULL,
  difficulty      TEXT,
  question_count  INTEGER NOT NULL DEFAULT 0,
  question_ids    TEXT NOT NULL DEFAULT '[]',
  score           INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  started_at      TEXT NOT NULL,
  completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id               TEXT PRIMARY KEY,
  attempt_id       TEXT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id      TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id TEXT,
  is_correct       INTEGER NOT NULL DEFAULT 0,
  time_ms          INTEGER
);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON quiz_answers(attempt_id);

-- ------------------------------------------------------------ achievements --
CREATE TABLE IF NOT EXISTS achievements (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  xp_bonus    INTEGER NOT NULL DEFAULT 0,
  criteria    TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id        TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TEXT NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- ------------------------------------------------------------- saved_words --
CREATE TABLE IF NOT EXISTS saved_words (
  user_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id  TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  saved_at TEXT NOT NULL,
  PRIMARY KEY (user_id, word_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_words_user ON saved_words(user_id);

-- ---------------------------------------------------------------- feedback --
CREATE TABLE IF NOT EXISTS feedback (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- ------------------------------------------------------------- user_stats --
CREATE TABLE IF NOT EXISTS user_stats (
  user_id            TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp                 INTEGER NOT NULL DEFAULT 0,
  total_reviews      INTEGER NOT NULL DEFAULT 0,
  total_correct      INTEGER NOT NULL DEFAULT 0,
  total_incorrect    INTEGER NOT NULL DEFAULT 0,
  current_streak     INTEGER NOT NULL DEFAULT 0,
  longest_streak     INTEGER NOT NULL DEFAULT 0,
  last_study_date    TEXT,
  quizzes_completed  INTEGER NOT NULL DEFAULT 0,
  context_correct    INTEGER NOT NULL DEFAULT 0,
  mistakes_reviewed  INTEGER NOT NULL DEFAULT 0,
  words_saved        INTEGER NOT NULL DEFAULT 0,
  study_days         INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------- daily_activity --
CREATE TABLE IF NOT EXISTS daily_activity (
  user_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date     TEXT NOT NULL,
  reviews  INTEGER NOT NULL DEFAULT 0,
  xp       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user ON daily_activity(user_id, date);

-- --------------------------------------------------------- admin_audit_log --
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          TEXT PRIMARY KEY,
  admin_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  details     TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at);
