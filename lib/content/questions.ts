import { mulberry32, shuffle, uid } from "@/lib/utils";
import type { Difficulty, QuestionType } from "@/types";
import type { SeedWordPart } from "./types";

/**
 * Deterministic quiz-question generation from the seed content.
 *
 * Question types produced:
 *  - meaning:  "What does the prefix 'bene-' mean?"          (one per part)
 *  - infer:    "Using the part 'trans-' ('across'), what does 'transport' most likely mean?"
 *  - context:  vocabulary-in-context from real example sentences
 *  - example:  "Which word is an example of the root 'cred'?"
 *  - compare:  hand-authored questions contrasting related parts
 */

export interface GeneratedOption {
  text: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  passage: string | null;
  relatedPartText: string | null;
  difficulty: Difficulty;
  category: string | null;
  explanation: string;
  author: string;
  options: GeneratedOption[];
}

const AUTHOR = "RootQuest Content Team";

function pickDistractors<T>(
  pool: T[],
  count: number,
  exclude: (item: T) => boolean,
  random: () => number
): T[] {
  const candidates = pool.filter((item) => !exclude(item));
  return shuffle(candidates, random).slice(0, count);
}

function makeOptions(
  correct: string,
  distractors: string[],
  random: () => number
): GeneratedOption[] {
  const options = shuffle(
    [
      { text: correct, isCorrect: true },
      ...distractors.map((text) => ({ text, isCorrect: false })),
    ],
    random
  );
  return options;
}

export function generateQuestions(parts: SeedWordPart[]): GeneratedQuestion[] {
  const random = mulberry32(20261006);
  const questions: GeneratedQuestion[] = [];

  const allMeanings = parts.map((p) => p.meaning);
  const allWords = parts.flatMap((p) =>
    p.words.map((w) => ({ ...w, part: p }))
  );
  const allDefinitions = allWords.map((w) => w.definition);
  const allWordTexts = allWords.map((w) => w.word);

  // ---------------------------------------------------------------- meaning --
  for (const part of parts) {
    const distractors = pickDistractors(
      allMeanings,
      3,
      (m) => m === part.meaning,
      random
    );
    const example = part.words[0];
    questions.push({
      id: uid(),
      type: "meaning",
      prompt: `What does the ${part.type} “${part.text}” mean?`,
      passage: null,
      relatedPartText: part.text,
      difficulty: part.difficulty,
      category: part.category,
      explanation: `The ${part.type} “${part.text}” means “${part.meaning}.” Example: ${example.word} — ${example.definition}.`,
      author: AUTHOR,
      options: makeOptions(part.meaning, distractors, random),
    });
  }

  // ------------------------------------------------------------------ infer --
  for (const entry of allWords) {
    const distractors = pickDistractors(
      allDefinitions,
      3,
      (d) => d === entry.definition,
      random
    );
    questions.push({
      id: uid(),
      type: "infer",
      prompt: `The word “${entry.word}” contains the ${entry.part.type} “${entry.part.text}” (“${entry.part.meaning}”). What does “${entry.word}” most likely mean?`,
      passage: null,
      relatedPartText: entry.part.text,
      difficulty: entry.difficulty ?? entry.part.difficulty,
      category: entry.part.category,
      explanation: `“${entry.word}” = ${entry.part.text} (“${entry.part.meaning}”) + the rest of the word, so it means “${entry.definition}.”`,
      author: AUTHOR,
      options: makeOptions(entry.definition, distractors, random),
    });
  }

  // ---------------------------------------------------------------- context --
  for (const entry of allWords) {
    const distractors = pickDistractors(
      allDefinitions,
      3,
      (d) => d === entry.definition,
      random
    );
    questions.push({
      id: uid(),
      type: "context",
      prompt: `In the sentence above, what does “${entry.word}” most nearly mean?`,
      passage: entry.sentence,
      relatedPartText: entry.part.text,
      difficulty: entry.difficulty ?? entry.part.difficulty,
      category: entry.part.category,
      explanation: `The context suggests “${entry.word}” means “${entry.definition}”: “${entry.sentence}”`,
      author: AUTHOR,
      options: makeOptions(entry.definition, distractors, random),
    });
  }

  // ---------------------------------------------------------------- example --
  for (const part of parts) {
    if (part.words.length === 0) continue;
    const correct = part.words[0].word;
    const distractors = pickDistractors(
      allWordTexts,
      3,
      (w) => part.words.some((pw) => pw.word === w),
      random
    );
    questions.push({
      id: uid(),
      type: "example",
      prompt: `Which word is an example of the ${part.type} “${part.text}” (“${part.meaning}”)?`,
      passage: null,
      relatedPartText: part.text,
      difficulty: part.difficulty,
      category: part.category,
      explanation: `“${correct}” contains the ${part.type} “${part.text}” (“${part.meaning}”).`,
      author: AUTHOR,
      options: makeOptions(correct, distractors, random),
    });
  }

  // ---------------------------------------------------------------- compare --
  const compareQuestions: Omit<
    GeneratedQuestion,
    "id" | "relatedPartText" | "category" | "options"
  >[] & { options: [string, string, string, string]; correctIndex: number }[] = [
    {
      type: "compare",
      prompt: "How do the prefixes “bene-” and “mal-” differ?",
      passage: null,
      difficulty: "beginner",
      explanation: "“Bene-” means good or well; “mal-” means bad. They are opposites.",
      author: AUTHOR,
      options: [
        "“bene-” means good; “mal-” means bad",
        "Both mean good",
        "“bene-” means bad; “mal-” means good",
        "They are exact synonyms",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "What is the relationship between “pre-” and “post-”?",
      passage: null,
      difficulty: "beginner",
      explanation: "“Pre-” means before and “post-” means after — they are opposites in time.",
      author: AUTHOR,
      options: [
        "They are opposites: before vs. after",
        "They both mean before",
        "They both mean after",
        "They are unrelated",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "How do “hyper-” and “hypo-” differ?",
      passage: null,
      difficulty: "intermediate",
      explanation: "“Hyper-” means over or excessive; “hypo-” means under or below.",
      author: AUTHOR,
      options: [
        "“hyper-” means over; “hypo-” means under",
        "Both mean over",
        "Both mean under",
        "They are synonyms",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "What do “micro-” and “macro-” have in common, and how do they differ?",
      passage: null,
      difficulty: "intermediate",
      explanation: "Both describe size, but “micro-” means small and “macro-” means large.",
      author: AUTHOR,
      options: [
        "Both describe size — small vs. large",
        "Both mean large",
        "Both mean small",
        "They describe color",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "How are “mono-” and “poly-” related?",
      passage: null,
      difficulty: "intermediate",
      explanation: "“Mono-” means one and “poly-” means many — opposite ideas about number.",
      author: AUTHOR,
      options: [
        "They are opposites: one vs. many",
        "They both mean one",
        "They both mean many",
        "They describe time",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "What do the suffixes “-able” and “-ible” have in common?",
      passage: null,
      difficulty: "beginner",
      explanation: "Both mean “able to be” — they are variant spellings of the same meaning.",
      author: AUTHOR,
      options: [
        "Both mean “able to be”",
        "Both mean “without”",
        "Both mean “full of”",
        "They are opposites",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "Which pair of roots both relate to speaking or writing?",
      passage: null,
      difficulty: "intermediate",
      explanation: "“Dict” means say and “scrib/script” means write — both are communication roots.",
      author: AUTHOR,
      options: [
        "dict and scrib/script",
        "aud and phon",
        "mot/mov and port",
        "terr and therm",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "How do “aud” and “phon” differ?",
      passage: null,
      difficulty: "intermediate",
      explanation: "“Aud” means hear and “phon” means sound — hearing is perceiving sound.",
      author: AUTHOR,
      options: [
        "“aud” is hearing; “phon” is sound",
        "They are identical in meaning",
        "Both mean light",
        "Both mean touch",
      ],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "Which suffix changes a noun into a verb meaning “to make”?",
      passage: null,
      difficulty: "intermediate",
      explanation: "“-ize” (and “-ify”, “-ate”, “-en”) turns a noun or adjective into a “to make” verb.",
      author: AUTHOR,
      options: ["-ize", "-ness", "-ful", "-less"],
      correctIndex: 0,
    },
    {
      type: "compare",
      prompt: "“Benevolent” and “malevolent” both contain a Latin root meaning “good” or “bad.” Which is which?",
      passage: null,
      difficulty: "advanced",
      explanation: "“Benevolent” = bene- (good) + vol (will) — kind; “malevolent” = mal- (bad) + vol (will) — wishing harm.",
      author: AUTHOR,
      options: [
        "benevolent = kind; malevolent = wishing harm",
        "benevolent = wishing harm; malevolent = kind",
        "both mean kind",
        "both mean wishing harm",
      ],
      correctIndex: 0,
    },
  ];

  for (const q of compareQuestions) {
    const options = shuffle(
      q.options.map((text, index) => ({
        text,
        isCorrect: index === q.correctIndex,
      })),
      random
    );
    questions.push({
      id: uid(),
      type: q.type,
      prompt: q.prompt,
      passage: q.passage,
      relatedPartText: null,
      difficulty: q.difficulty,
      category: "word parts",
      explanation: q.explanation,
      author: q.author,
      options,
    });
  }

  return questions;
}
