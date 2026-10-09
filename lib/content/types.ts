import type { Difficulty, PartType } from "@/types";

export interface SeedWord {
  word: string;
  definition: string;
  sentence: string;
  difficulty?: Difficulty;
}

export interface SeedWordPart {
  text: string;
  type: PartType;
  meaning: string;
  description: string;
  origin: string;
  difficulty: Difficulty;
  category: string;
  mnemonic: string;
  related: string[];
  words: SeedWord[];
}

export interface SeedLesson {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  orderIndex: number;
  /** Word-part texts included in this lesson, in order. */
  parts: string[];
}

export interface SeedAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
}
