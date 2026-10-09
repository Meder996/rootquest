import { describe, expect, it } from "vitest";
import {
  questionSchema,
  quizStartSchema,
  registerSchema,
  reviewSchema,
} from "@/lib/validation/schemas";

const validOptions = [
  { text: "good", isCorrect: true },
  { text: "bad", isCorrect: false },
  { text: "big", isCorrect: false },
  { text: "small", isCorrect: false },
];

const validQuestion = {
  type: "meaning" as const,
  prompt: "What does the prefix bene- mean?",
  difficulty: "beginner" as const,
  explanation: "It means good.",
  options: validOptions,
};

describe("validation schemas", () => {
  it("accepts a valid question", () => {
    expect(() => questionSchema.parse(validQuestion)).not.toThrow();
  });

  it("rejects questions without exactly 4 options", () => {
    expect(() =>
      questionSchema.parse({ ...validQuestion, options: validOptions.slice(0, 3) })
    ).toThrow();
  });

  it("rejects questions without exactly one correct answer", () => {
    expect(() =>
      questionSchema.parse({
        ...validQuestion,
        options: validOptions.map((o, i) => ({ ...o, isCorrect: i < 2 })),
      })
    ).toThrow();
  });

  it("rejects publishing a question without an explanation", () => {
    expect(() =>
      questionSchema.parse({
        ...validQuestion,
        status: "published",
        explanation: "",
      })
    ).toThrow();
  });

  it("allows drafts with one correct answer", () => {
    expect(() =>
      questionSchema.parse({ ...validQuestion, status: "draft" })
    ).not.toThrow();
  });

  it("enforces password rules on registration", () => {
    expect(() =>
      registerSchema.parse({ name: "A", email: "a@b.com", password: "short" })
    ).toThrow();
    expect(() =>
      registerSchema.parse({ name: "A", email: "not-an-email", password: "longenough1" })
    ).toThrow();
    expect(() =>
      registerSchema.parse({
        name: "Ada",
        email: "ada@example.com",
        password: "longenough1",
      })
    ).not.toThrow();
  });

  it("validates quiz start options", () => {
    expect(() =>
      quizStartSchema.parse({ mode: "mixed", count: 10 })
    ).not.toThrow();
    expect(() => quizStartSchema.parse({ mode: "mixed", count: 2 })).toThrow();
    expect(() => quizStartSchema.parse({ mode: "mixed", count: 99 })).toThrow();
  });

  it("validates review ratings", () => {
    expect(() =>
      reviewSchema.parse({ wordPartId: "x", rating: "good" })
    ).not.toThrow();
    expect(() =>
      reviewSchema.parse({ wordPartId: "x", rating: "perfect" })
    ).toThrow();
  });
});
