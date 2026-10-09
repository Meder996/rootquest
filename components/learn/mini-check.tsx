"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, GraduationCap, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MiniQuestion {
  id: string;
  type: string;
  prompt: string;
  difficulty: string;
  options?: { id: string; text: string }[];
}

/**
 * Mini-check on the word-part details page. Loads full questions (with
 * options) from the public endpoint and gives instant feedback.
 */
export function MiniCheck({ questions, partId }: { questions: MiniQuestion[]; partId: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState<MiniQuestion | null>(null);
  const [options, setOptions] = useState<{ id: string; text: string; isCorrect?: boolean }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadQuestion(q: MiniQuestion) {
    setIsLoading(true);
    setSelected(null);
    setQuestion(q);
    try {
      const res = await fetch(`/api/questions/${q.id}`);
      if (res.ok) {
        const data = await res.json();
        setOptions(data.options);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (questions.length === 0) return null;

  if (!question) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-bold">Mini-check</h3>
        <p className="text-sm text-muted">
          Ready to test yourself? Answer a quick question about this part.
        </p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, index) => (
            <Button
              key={q.id}
              variant="secondary"
              size="sm"
              onClick={() => loadQuestion(q)}
            >
              Question {index + 1}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/quiz?partId=${partId}`)}
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Full quiz
          </Button>
        </div>
      </div>
    );
  }

  const correctOption = options.find((o) => o.isCorrect);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-bold">Mini-check</h3>
      <p className="text-sm font-medium">{question.prompt}</p>
      <div className="grid gap-2">
        {options.map((option, index) => {
          const isSelected = selected === option.id;
          const isCorrect = option.isCorrect === true;
          return (
            <button
              key={option.id}
              type="button"
              disabled={selected !== null || isLoading}
              onClick={() => setSelected(option.id)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                selected === null && "border-border bg-surface hover:border-violet hover:bg-card",
                isSelected && isCorrect && "border-success/50 bg-success/10 text-success",
                isSelected && !isCorrect && "border-coral/50 bg-coral/10 text-coral",
                selected !== null && !isSelected && isCorrect && "border-success/50 bg-success/10 text-success",
                selected !== null && !isSelected && !isCorrect && "border-border bg-surface opacity-60"
              )}
            >
              <span>
                <span className="mr-2 text-muted">{index + 1}.</span>
                {option.text}
              </span>
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
        <div className="flex flex-col gap-3">
          <p
            className={cn(
              "flex items-start gap-2 rounded-xl px-4 py-3 text-sm animate-scale-in",
              selected === correctOption?.id
                ? "bg-success/10 text-success"
                : "bg-coral/10 text-coral"
            )}
          >
            {selected === correctOption?.id ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {selected === correctOption?.id
              ? "Correct! Keep going."
              : `Not quite — the correct answer is “${correctOption?.text}”.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const remaining = questions.filter((q) => q.id !== question.id);
                if (remaining.length > 0) loadQuestion(remaining[0]);
                else setQuestion(null);
              }}
            >
              {questions.filter((q) => q.id !== question.id).length > 0
                ? "Next question"
                : "Finish"}
            </Button>
            <Link href={`/quiz?partId=${partId}`}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                Full quiz
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
