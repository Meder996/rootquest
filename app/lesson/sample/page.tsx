"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

/**
 * Public sample lesson: three real word parts with flip cards and a
 * mini-check quiz — no account required.
 */

const sampleParts = [
  {
    text: "trans-",
    type: "Prefix",
    meaning: "across; through",
    description:
      "Trans- means “across” or “through.” To transport something is to carry it across a distance.",
    mnemonic: "A transcript is carried across to a new school.",
    examples: [
      { word: "transport", definition: "to carry across" },
      { word: "transfer", definition: "to carry across to another" },
      { word: "transform", definition: "to change across form" },
    ],
  },
  {
    text: "cred",
    type: "Root",
    meaning: "believe",
    description:
      "Cred means “believe.” A credible source is one you can believe; an incredible story is hard to believe.",
    mnemonic: "Credit is trust given to someone.",
    examples: [
      { word: "credible", definition: "believable" },
      { word: "incredible", definition: "not believable" },
      { word: "credential", definition: "proof of belief in someone's ability" },
    ],
  },
  {
    text: "-able",
    type: "Suffix",
    meaning: "able to be",
    description:
      "The suffix -able turns verbs into adjectives describing what can be done — readable, flexible, credible.",
    mnemonic: "Readable — able to be read.",
    examples: [
      { word: "readable", definition: "able to be read" },
      { word: "flexible", definition: "able to bend easily" },
      { word: "possible", definition: "able to be done" },
    ],
  },
];

const miniCheck = [
  {
    prompt: "What does the prefix “trans-” mean?",
    options: ["before", "across; through", "against", "under"],
    correctIndex: 1,
    explanation:
      "Trans- means “across” or “through,” as in transport (carry across).",
  },
  {
    prompt: "The word “incredible” contains the root “cred” (“believe”). What does “incredible” mean?",
    options: [
      "full of belief",
      "not believable",
      "believing too much",
      "without belief in others",
    ],
    correctIndex: 1,
    explanation:
      "In- (not) + cred (believe) + -ible (able to be) = not able to be believed.",
  },
  {
    prompt: "Which word correctly uses the suffix “-able” (“able to be”)?",
    options: ["happiness", "readable", "quickly", "teacher"],
    correctIndex: 1,
    explanation: "Readable = able to be read — it ends in -able.",
  },
];

export default function SampleLessonPage() {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);

  const score = answers.filter(
    (a, i) => a === miniCheck[i].correctIndex
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <Badge tone="turquoise">Free sample</Badge>
        <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
          Sample lesson: <span className="text-gradient">decode three parts</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          This is a real slice of RootQuest. Flip each card, read the examples,
          then take the mini-check. Create an account to unlock all 130 parts.
        </p>
      </div>

      {/* ------------------------------------------------------ flip cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {sampleParts.map((part, index) => {
          const flipped = flippedIndex === index;
          return (
            <button
              key={part.text}
              type="button"
              onClick={() => setFlippedIndex(flipped ? null : index)}
              aria-label={flipped ? "Show the word part" : "Show the meaning"}
              className="group block h-72 text-left [perspective:1200px]"
            >
              <div
                className={cn(
                  "relative h-full w-full transition-all duration-500 [transform-style:preserve-3d]",
                  flipped && "[transform:rotateY(180deg)]"
                )}
              >
                <div className="card-surface absolute inset-0 flex flex-col items-center justify-center gap-3 [backface-visibility:hidden] group-hover:border-violet/50">
                  <Badge tone="muted">{part.type}</Badge>
                  <span className="font-display text-4xl font-extrabold text-gradient">
                    {part.text}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Flip to see the meaning
                  </span>
                </div>
                <div className="card-surface absolute inset-0 flex flex-col gap-3 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="flex items-center justify-between">
                    <Badge tone="muted">{part.type}</Badge>
                    <span className="font-display text-xl font-bold text-turquoise">
                      {part.meaning}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {part.description}
                  </p>
                  <p className="flex items-start gap-2 rounded-xl bg-card px-3 py-2 text-xs text-yellow">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {part.mnemonic}
                  </p>
                  <ul className="mt-auto flex flex-col gap-1.5">
                    {part.examples.map((example) => (
                      <li key={example.word} className="text-xs">
                        <span className="font-semibold text-text">{example.word}</span>
                        <span className="text-muted"> — {example.definition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------- mini-check */}
      <Card className="mt-12">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold">Mini-check</h2>
          <p className="text-sm text-muted">
            Three questions, just like the real quizzes. Pick an answer to see
            instant feedback.
          </p>
          <ProgressBar
            value={answers.filter((a) => a !== null).length}
            max={miniCheck.length}
            label="Questions answered"
          />
        </div>

        <div className="flex flex-col gap-8">
          {miniCheck.map((question, qIndex) => {
            const selected = answers[qIndex];
            return (
              <div key={qIndex} className="flex flex-col gap-3">
                <p className="font-semibold">
                  {qIndex + 1}. {question.prompt}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selected === oIndex;
                    const isCorrect = oIndex === question.correctIndex;
                    return (
                      <button
                        key={oIndex}
                        type="button"
                        disabled={selected !== null}
                        onClick={() =>
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[qIndex] = oIndex;
                            return next;
                          })
                        }
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                          selected === null &&
                            "border-border bg-surface hover:border-violet hover:bg-card",
                          isSelected &&
                            isCorrect &&
                            "border-success/50 bg-success/10 text-success",
                          isSelected &&
                            !isCorrect &&
                            "border-coral/50 bg-coral/10 text-coral",
                          selected !== null &&
                            !isSelected &&
                            isCorrect &&
                            "border-success/50 bg-success/10 text-success",
                          selected !== null &&
                            !isSelected &&
                            !isCorrect &&
                            "border-border bg-surface opacity-60"
                        )}
                      >
                        <span>{option}</span>
                        {selected !== null && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                        {isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {selected !== null && (
                  <p
                    className={cn(
                      "flex items-start gap-2 rounded-xl px-4 py-3 text-sm animate-scale-in",
                      selected === question.correctIndex
                        ? "bg-success/10 text-success"
                        : "bg-coral/10 text-coral"
                    )}
                  >
                    {selected === question.correctIndex ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-border pt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setAnswers([null, null, null]);
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset the mini-check
          </Button>
          <p className="text-sm text-muted">
            Scored {score} / {miniCheck.length} — in the full app, every question
            also feeds your spaced-repetition schedule.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              Unlock all 130 word parts <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
