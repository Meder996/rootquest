import { describe, expect, it } from "vitest";
import {
  applyReview,
  describeDueReason,
  intervalForStreak,
  statusForStreak,
  type ProgressSnapshot,
} from "@/lib/srs/algorithm";

function freshState(): ProgressSnapshot {
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

describe("spaced repetition algorithm", () => {
  it("schedules the first Good review in 10 minutes and awards XP", () => {
    const now = new Date("2026-10-09T12:00:00Z");
    const result = applyReview(freshState(), "good", now);
    expect(result.updates.streak).toBe(1);
    expect(result.updates.status).toBe("learning");
    expect(result.updates.intervalMinutes).toBe(10);
    expect(result.updates.correctCount).toBe(1);
    expect(result.xp).toBe(10); // 5 base + 5 first-correct bonus
    expect(result.updates.nextReviewAt).toBe("2026-10-09T12:10:00.000Z");
  });

  it("Again resets the streak and returns the item almost immediately", () => {
    const state = freshState();
    state.streak = 5;
    state.correctCount = 5;
    state.status = "strong";
    const result = applyReview(state, "again");
    expect(result.updates.streak).toBe(0);
    expect(result.updates.status).toBe("learning");
    expect(result.updates.intervalMinutes).toBe(1);
    expect(result.updates.incorrectCount).toBe(1);
    expect(result.xp).toBe(2);
  });

  it("Hard returns the item sooner than Good", () => {
    const now = new Date();
    const good = applyReview(freshState(), "good", now);
    const hard = applyReview(freshState(), "hard", now);
    expect(hard.updates.intervalMinutes!).toBeLessThan(
      good.updates.intervalMinutes!
    );
    expect(hard.updates.easeFactor!).toBeLessThan(2.5);
  });

  it("Easy schedules the item farther into the future than Good", () => {
    const now = new Date();
    const good = applyReview(freshState(), "good", now);
    const easy = applyReview(freshState(), "easy", now);
    expect(easy.updates.intervalMinutes!).toBeGreaterThan(
      good.updates.intervalMinutes!
    );
    expect(easy.updates.easeFactor!).toBeGreaterThan(2.5);
    expect(easy.xp).toBeGreaterThan(good.xp);
  });

  it("reaches Mastered after 8 consecutive correct reviews", () => {
    let state = freshState();
    const now = new Date("2026-10-09T12:00:00Z");
    for (let i = 0; i < 8; i++) {
      state = { ...state, ...applyReview(state, "good", now).updates };
    }
    expect(state.streak).toBe(8);
    expect(state.status).toBe("mastered");
  });

  it("keeps the ease factor above the minimum", () => {
    let state = freshState();
    state.easeFactor = 1.3;
    const result = applyReview(state, "again");
    expect(result.updates.easeFactor).toBe(1.3);
  });

  it("computes mastery statuses from streaks", () => {
    expect(statusForStreak(0, 0)).toBe("new");
    expect(statusForStreak(0, 3)).toBe("learning");
    expect(statusForStreak(1, 1)).toBe("learning");
    expect(statusForStreak(3, 3)).toBe("familiar");
    expect(statusForStreak(5, 5)).toBe("strong");
    expect(statusForStreak(8, 8)).toBe("mastered");
  });

  it("uses the interval ladder", () => {
    expect(intervalForStreak(1)).toBe(10);
    expect(intervalForStreak(2)).toBe(60 * 24);
    expect(intervalForStreak(100)).toBe(60 * 24 * 180);
  });

  it("explains why an item is due", () => {
    expect(describeDueReason(freshState())).toContain("New");
    const missed: ProgressSnapshot = {
      ...freshState(),
      status: "learning",
      incorrectCount: 2,
    };
    expect(describeDueReason(missed)).toContain("missed");
  });
});
