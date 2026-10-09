import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ListChecks,
  Map,
  Repeat,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardGrid } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How RootQuest SAT teaches vocabulary with spaced repetition, word building, and SAT-style practice.",
};

const steps = [
  {
    icon: Target,
    title: "1. Set your goal",
    description:
      "Pick your SAT date (or “not sure”), choose a daily review goal, and get a recommended starting lesson.",
  },
  {
    icon: BookOpen,
    title: "2. Learn the parts",
    description:
      "Study prefixes, roots, and suffixes with plain-English explanations, visual mnemonics, and example sentences.",
  },
  {
    icon: Repeat,
    title: "3. Review with spaced repetition",
    description:
      "Rate each flashcard Again, Hard, Good, or Easy. The scheduler brings items back right before you would forget them.",
  },
  {
    icon: GraduationCap,
    title: "4. Practice like the SAT",
    description:
      "Take quizzes by category, difficulty, or lesson — including vocabulary-in-context questions from short passages.",
  },
  {
    icon: ListChecks,
    title: "5. Fix your mistakes",
    description:
      "Every missed question lands in your Error Laboratory, where you can review it until it sticks.",
  },
  {
    icon: Map,
    title: "6. Grow your garden",
    description:
      "Earn XP, keep your streak alive, unlock achievements, and watch your mastery percentage climb.",
  },
];

const questionTypes = [
  "Select the meaning of a prefix, root, or suffix",
  "Infer an unfamiliar word from its parts",
  "Choose the best example word",
  "Choose the sentence using a word correctly",
  "Select the closest meaning",
  "Complete a sentence",
  "Compare related words",
  "Identify the part that changes meaning",
  "Vocabulary-in-context multiple choice",
  "Match word parts to meanings",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
          How <span className="text-gradient">RootQuest</span> works
        </h1>
        <p className="mt-4 text-lg text-muted">
          The SAT Reading and Writing section rewards students who can infer the
          meaning of unfamiliar words from their parts and from context. RootQuest
          trains exactly that skill — interactively.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/10 text-violet">
              <step.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.description}</p>
          </Card>
        ))}
      </div>

      <CardGrid className="mt-10 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-display text-xl font-bold">Question types you will practice</h3>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {questionTypes.map((type) => (
              <li key={type} className="flex items-start gap-2 text-sm text-muted">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-turquoise"
                  aria-hidden="true"
                />
                {type}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-turquoise/30 bg-gradient-to-br from-turquoise/10 to-card">
          <h3 className="mb-4 font-display text-xl font-bold">Ready to start?</h3>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            Create a free account and your first lesson will be waiting. You can
            also try the sample lesson and sample quiz without signing up.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/sign-up">
              <Button>Create an account</Button>
            </Link>
            <Link href="/lesson/sample">
              <Button variant="outline">Sample lesson</Button>
            </Link>
            <Link href="/quiz/demo">
              <Button variant="ghost">Sample quiz</Button>
            </Link>
          </div>
        </Card>
      </CardGrid>
    </div>
  );
}
