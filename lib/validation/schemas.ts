import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(72, "Password must be at most 72 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Reset token is required"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(72, "Password must be at most 72 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(72, "Password must be at most 72 characters"),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80).optional(),
  dailyGoal: z.coerce.number().int().min(1).max(500).optional(),
  satDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format")
    .nullable()
    .optional(),
  timezone: z.string().min(2).max(64).optional(),
  preferences: z.record(z.boolean()).optional(),
});

export const wordPartSchema = z.object({
  text: z.string().trim().min(1, "Word part text is required").max(40),
  type: z.enum(["prefix", "root", "suffix"]),
  meaning: z.string().trim().min(1, "Meaning is required").max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  origin: z.string().trim().max(60).nullable().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.string().trim().max(60).nullable().optional(),
  visualMnemonic: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const wordSchema = z.object({
  wordPartId: z.string().min(1, "A word part is required"),
  word: z.string().trim().min(1, "Word is required").max(80),
  definition: z.string().trim().min(1, "Definition is required").max(300),
  sentence: z.string().trim().max(500).nullable().optional(),
  pronunciation: z.string().trim().max(120).nullable().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const questionOptionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required").max(300),
  isCorrect: z.boolean().optional().default(false),
});

export const questionBaseSchema = z.object({
  type: z.enum(["meaning", "infer", "example", "context", "compare", "match"]),
  prompt: z.string().trim().min(5, "Prompt is required").max(1000),
  passage: z.string().trim().max(2000).nullable().optional(),
  relatedPartId: z.string().nullable().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.string().trim().max(60).nullable().optional(),
  explanation: z.string().trim().min(1, "Explanation is required").max(1500),
  author: z.string().trim().max(80).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  options: z
    .array(questionOptionSchema)
    .min(4, "Multiple-choice questions need exactly 4 options")
    .max(4, "Multiple-choice questions need exactly 4 options"),
});

/** Partial schema for PATCH updates (options replaced when provided). */
export const questionUpdateSchema = questionBaseSchema.partial();

export const questionSchema = questionBaseSchema.superRefine((value, ctx) => {
    const correctCount = value.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one option must be marked correct",
        path: ["options"],
      });
    }
    if (value.status === "published") {
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A question cannot be published without exactly one correct answer",
          path: ["status"],
        });
      }
      if (!value.explanation || value.explanation.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A published question requires an explanation",
          path: ["explanation"],
        });
      }
    }
  });

export const lessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  category: z.string().trim().max(60).nullable().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  status: z.enum(["draft", "published", "archived"]).optional(),
  orderIndex: z.coerce.number().int().min(0).max(10000).optional(),
});

export const lessonPartsSchema = z.object({
  partIds: z
    .array(z.string().min(1))
    .min(1, "A lesson needs at least one word part"),
});

export const reviewSchema = z.object({
  wordPartId: z.string().min(1, "wordPartId is required"),
  rating: z.enum(["again", "hard", "good", "easy"]),
  sessionId: z.string().min(1).nullable().optional(),
});

export const quizStartSchema = z.object({
  mode: z.enum(["mixed", "category", "difficulty", "lesson", "review"]),
  category: z.string().trim().max(60).nullable().optional(),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .nullable()
    .optional(),
  lessonId: z.string().min(1).nullable().optional(),
  count: z.coerce.number().int().min(3).max(40).default(10),
  timed: z.boolean().optional().default(false),
});

export const quizAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
  timeMs: z.coerce.number().int().min(0).max(600000).nullable().optional(),
});

export const feedbackSchema = z.object({
  subject: z.string().trim().max(120).nullable().optional(),
  message: z.string().trim().min(5, "Please write a short message").max(4000),
  reportedQuestionId: z.string().min(1).nullable().optional(),
});

export const savedWordSchema = z.object({
  wordId: z.string().min(1, "wordId is required"),
});

export const userRoleSchema = z.object({
  role: z.enum(["student", "teacher", "admin"]),
});

export const studySessionSchema = z.object({
  mode: z.enum(["flashcards", "learn", "review", "lesson"]),
});
