import { PREFIXES } from "./prefixes";
import { ROOTS_1 } from "./roots-1";
import { ROOTS_2 } from "./roots-2";
import { SUFFIXES } from "./suffixes";
import type { SeedAchievement, SeedLesson, SeedWordPart } from "./types";

export type { SeedWordPart, SeedWord, SeedLesson, SeedAchievement } from "./types";

/** All 130 word parts: 40 prefixes + 60 roots + 30 suffixes. */
export const ALL_WORD_PARTS: SeedWordPart[] = [
  ...PREFIXES,
  ...ROOTS_1,
  ...ROOTS_2,
  ...SUFFIXES,
];

export const PART_COUNTS = {
  prefixes: PREFIXES.length,
  roots: ROOTS_1.length + ROOTS_2.length,
  suffixes: SUFFIXES.length,
  total: ALL_WORD_PARTS.length,
};

/** 12 lessons covering every word part, themed by the learning worlds. */
export const LESSONS: SeedLesson[] = [
  {
    title: "Prefix Planet: Time & Order",
    description: "Learn the prefixes that place events before, after, or in sequence.",
    category: "Prefix Planet",
    difficulty: "beginner",
    orderIndex: 1,
    parts: ["pre-", "post-", "ante-", "fore-", "re-", "retro-"],
  },
  {
    title: "Prefix Planet: Space & Direction",
    description: "Move across, between, around, under, and above with position prefixes.",
    category: "Prefix Planet",
    difficulty: "beginner",
    orderIndex: 2,
    parts: ["trans-", "inter-", "circum-", "peri-", "sub-", "super-", "in-/im-/en-/em-"],
  },
  {
    title: "Prefix Planet: Negation & Opposition",
    description: "Master the prefixes that negate, reverse, or oppose meaning.",
    category: "Prefix Planet",
    difficulty: "beginner",
    orderIndex: 3,
    parts: ["a-/an-", "anti-", "contra-/counter-", "dis-", "in-/im-", "non-", "un-", "mis-"],
  },
  {
    title: "Prefix Planet: Number, Size & Degree",
    description: "Count, measure, and scale your vocabulary with number and degree prefixes.",
    category: "Prefix Planet",
    difficulty: "intermediate",
    orderIndex: 4,
    parts: [
      "bi-", "mono-", "uni-", "multi-", "poly-", "semi-", "omni-", "pan-",
      "macro-", "micro-", "hyper-", "hypo-", "ultra-", "over-", "under-",
    ],
  },
  {
    title: "Prefix Planet: Good, Self & Together",
    description: "Prefixes of evaluation, self-reference, and union.",
    category: "Prefix Planet",
    difficulty: "intermediate",
    orderIndex: 5,
    parts: ["bene-/bon-", "eu-", "auto-", "syn-/sym-"],
  },
  {
    title: "Root Forest: Speaking, Writing & Sound",
    description: "Roots for saying, writing, reading, and hearing.",
    category: "Root Forest",
    difficulty: "beginner",
    orderIndex: 6,
    parts: ["dict", "log/logue", "verb", "scrib/script", "graph/gram", "phon", "aud", "duc/duct", "lect/leg/lig"],
  },
  {
    title: "Root Forest: Motion, Carrying & Following",
    description: "Roots for going, carrying, sending, and rolling.",
    category: "Root Forest",
    difficulty: "beginner",
    orderIndex: 7,
    parts: [
      "ced/ceed/cess", "grad/gress", "mot/mov/mob", "port", "fer", "tract",
      "ject", "pel/puls", "flu/flux", "mit/miss", "sequ/sec", "ven/vent",
      "vers/vert", "volv/volu",
    ],
  },
  {
    title: "Root Forest: Mind, Judgment & Sight",
    description: "Roots for believing, feeling, judging, and seeing.",
    category: "Root Forest",
    difficulty: "intermediate",
    orderIndex: 8,
    parts: ["cred", "fid", "sent/sens", "path", "jud/jur/jus", "equ", "spec/spic", "vid/vis", "luc/lum/lus", "ver"],
  },
  {
    title: "Root Forest: Making, Shaping & Growing",
    description: "Roots for making, breaking, building, standing, and naming.",
    category: "Root Forest",
    difficulty: "intermediate",
    orderIndex: 9,
    parts: [
      "fac/fact/fect", "form", "fract/frag", "rupt", "struct", "gen", "nat",
      "grat", "nov", "pos/pon/pound", "sta/stat/stan", "ten/tin/tent", "tort",
    ],
  },
  {
    title: "Root Forest: Life, Body, Land & Time",
    description: "Roots for living, the body, nature, names, and time.",
    category: "Root Forest",
    difficulty: "intermediate",
    orderIndex: 10,
    parts: [
      "bio", "vit/viv", "chron", "man/manu", "mort", "nomen/nomin", "ped/pod",
      "prim", "spir", "tact/tag/tang", "terr", "therm", "vac", "pend/pens",
    ],
  },
  {
    title: "Suffix City: Adjectives",
    description: "Suffixes that build descriptive words.",
    category: "Suffix City",
    difficulty: "beginner",
    orderIndex: 11,
    parts: ["-able/-ible", "-al", "-ful", "-less", "-ous/-ose", "-ive", "-ic/-ical", "-ish", "-ant/-ent", "-ing", "-ity/-ty"],
  },
  {
    title: "Suffix City: Nouns, Verbs & People",
    description: "Suffixes that build nouns, verbs, and names for people.",
    category: "Suffix City",
    difficulty: "intermediate",
    orderIndex: 12,
    parts: [
      "-ance/-ence", "-ate", "-cide", "-cracy", "-dom", "-ee", "-en",
      "-er/-or", "-fy/-ify", "-hood", "-ian", "-ion/-tion/-sion", "-ism",
      "-ist", "-ize", "-logy", "-ment", "-ness", "-ship",
    ],
  },
];

/** 11 achievements with XP bonuses. */
export const ACHIEVEMENTS: SeedAchievement[] = [
  {
    code: "first_sprout",
    name: "First Root Learned",
    description: "Learn your first word part in a study session.",
    icon: "Sprout",
    xpBonus: 25,
  },
  {
    code: "prefix_explorer",
    name: "Prefix Explorer",
    description: "Reach Mastered on 10 prefixes.",
    icon: "Telescope",
    xpBonus: 50,
  },
  {
    code: "root_forest_complete",
    name: "Root Forest Complete",
    description: "Reach Mastered on 25 roots.",
    icon: "Trees",
    xpBonus: 100,
  },
  {
    code: "suffix_city_scholar",
    name: "Suffix City Scholar",
    description: "Reach Mastered on 10 suffixes.",
    icon: "Building2",
    xpBonus: 50,
  },
  {
    code: "seven_day_streak",
    name: "Seven-Day Streak",
    description: "Study on 7 consecutive days.",
    icon: "Flame",
    xpBonus: 75,
  },
  {
    code: "hundred_correct",
    name: "100 Correct Answers",
    description: "Answer 100 flashcard and quiz questions correctly.",
    icon: "Target",
    xpBonus: 100,
  },
  {
    code: "sat_arena_champion",
    name: "SAT Arena Champion",
    description: "Score 100% on a quiz of 10 or more questions.",
    icon: "Trophy",
    xpBonus: 150,
  },
  {
    code: "context_master",
    name: "Context Master",
    description: "Answer 10 vocabulary-in-context questions correctly.",
    icon: "BookOpenCheck",
    xpBonus: 75,
  },
  {
    code: "error_fixer",
    name: "Error Fixer",
    description: "Correctly review 25 items you previously missed.",
    icon: "Wrench",
    xpBonus: 75,
  },
  {
    code: "word_collector",
    name: "Word Collector",
    description: "Save 25 words to your personal list.",
    icon: "Bookmark",
    xpBonus: 50,
  },
  {
    code: "weekly_goal",
    name: "Weekly Goal Getter",
    description: "Study on 5 different days in one week.",
    icon: "CalendarCheck",
    xpBonus: 100,
  },
];
