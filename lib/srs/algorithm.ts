import type { MasteryStatus, ReviewRating } from "@/types";

/**
 * Spaced-repetition scheduling (an SM-2-inspired Leitner-style algorithm).
 *
 * Every item has a review state: New, Learning, Familiar, Strong, Mastered.
 * Scheduling considers correctness, the self-rated difficulty, consecutive
 * correct answers, time since last review, and recent mistakes:
 *  - Again returns an item almost immediately and resets its streak.
 *  - Hard returns it sooner than Good.
 *  - Easy schedules it farther into the future.
 *  - Mastered items return occasionally for maintenance.
 */

export interface ProgressSnapshot {
  status: MasteryStatus;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  easeFactor: number;
  intervalMinutes: number;
  lastRating: ReviewRating | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}

export interface ReviewResult {
  updates: Partial<ProgressSnapshot>;
  /** XP awarded for this review. */
  xp: number;
}

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Interval ladder (minutes) indexed by consecutive-correct streak.
 * streak 1 -> 10 minutes, 2 -> 1 day, 3 -> 3 days, ... up to 180 days.
 */
export const INTERVAL_LADDER_MINUTES = [
  10, // streak 1
  60 * 24, // streak 2  (1 day)
  60 * 24 * 3, // streak 3
  60 * 24 * 7, // streak 4
  60 * 24 * 21, // streak 5
  60 * 24 * 60, // streak 6
  60 * 24 * 180, // streak 7+
];

export function intervalForStreak(streak: number): number {
  const index = Math.min(Math.max(streak, 1), INTERVAL_LADDER_MINUTES.length) - 1;
  return INTERVAL_LADDER_MINUTES[index];
}

/** Derive the mastery status from the streak and correct count. */
export function statusForStreak(
  streak: number,
  correctCount: number
): MasteryStatus {
  if (streak <= 0) return correctCount > 0 ? "learning" : "new";
  if (streak <= 2) return "learning";
  if (streak <= 4) return "familiar";
  if (streak <= 7) return "strong";
  return "mastered";
}

/** XP awarded per rating (Easy grants a bonus; Again grants a small amount). */
export function xpForRating(rating: ReviewRating, firstCorrect: boolean): number {
  const base: Record<ReviewRating, number> = {
    again: 2,
    hard: 7,
    good: 5,
    easy: 10,
  };
  return base[rating] + (firstCorrect ? 5 : 0);
}

/**
 * Apply a review rating to a progress snapshot.
 * `now` is injectable for deterministic tests.
 */
export function applyReview(
  state: ProgressSnapshot,
  rating: ReviewRating,
  now: Date = new Date()
): ReviewResult {
  const ease = state.easeFactor || DEFAULT_EASE_FACTOR;
  const correct = rating === "good" || rating === "easy";
  const firstCorrect = correct && state.correctCount === 0;

  let streak: number;
  let easeFactor: number;
  let intervalMinutes: number;

  if (rating === "again") {
    // Mistake: reset the streak, lower the ease factor, due almost immediately.
    streak = 0;
    easeFactor = Math.max(MIN_EASE_FACTOR, ease - 0.2);
    intervalMinutes = 1;
  } else if (rating === "hard") {
    // Correct but effortful: keep the streak, shorten the interval, lower ease.
    streak = state.streak;
    easeFactor = Math.max(MIN_EASE_FACTOR, ease - 0.15);
    const goodInterval = intervalForStreak(Math.max(streak, 1));
    intervalMinutes = Math.max(5, Math.round(goodInterval * 0.5));
  } else {
    // Good / Easy: grow the streak and extend the interval.
    streak = state.streak + 1;
    const base = intervalForStreak(streak);
    if (rating === "easy") {
      easeFactor = ease + 0.15;
      intervalMinutes = Math.round(base * 1.5);
    } else {
      easeFactor = ease;
      intervalMinutes = base;
    }
  }

  const nextReviewAt = new Date(
    now.getTime() + intervalMinutes * 60_000
  ).toISOString();

  return {
    xp: xpForRating(rating, firstCorrect),
    updates: {
      status: statusForStreak(streak, state.correctCount + (correct ? 1 : 0)),
      correctCount: state.correctCount + (correct ? 1 : 0),
      incorrectCount: state.incorrectCount + (correct ? 0 : 1),
      streak,
      easeFactor,
      intervalMinutes,
      lastRating: rating,
      lastReviewedAt: now.toISOString(),
      nextReviewAt,
    },
  };
}

/** A short human explanation of why an item is due (shown in the UI). */
export function describeDueReason(
  state: ProgressSnapshot,
  now: Date = new Date()
): string {
  if (state.status === "new") return "New item — not studied yet.";
  if (state.lastRating === "again" || state.incorrectCount > 0) {
    return "You missed this recently — it is back for review.";
  }
  if (state.status === "mastered") {
    return "Mastered — occasional maintenance keeps it fresh.";
  }
  if (state.status === "strong") return "Strong — due for its next spaced review.";
  if (state.status === "familiar") return "Familiar — due for its next spaced review.";
  const due = state.nextReviewAt ? new Date(state.nextReviewAt) : null;
  if (due && due.getTime() > now.getTime()) {
    return "Learning in progress — scheduled by the spaced-repetition system.";
  }
  return "Due for review.";
}
