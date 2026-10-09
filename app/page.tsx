import Link from "next/link";
import {
  ArrowRight,
  Brain,
  GraduationCap,
  Layers,
  LineChart,
  Sparkles,
  Timer,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SampleCard } from "@/components/landing/sample-card";
import { LearningPath } from "@/components/landing/learning-path";

const features = [
  {
    icon: Brain,
    title: "Spaced repetition",
    description:
      "A smart scheduler resurfaces each word part right before you would forget it — Again, Hard, Good, or Easy.",
    tone: "text-violet",
  },
  {
    icon: Wand2,
    title: "Word Builder",
    description:
      "Combine parts like trans- + port and infer the meaning of transport before you ever see the definition.",
    tone: "text-turquoise",
  },
  {
    icon: Layers,
    title: "Context practice",
    description:
      "Read short SAT-style passages and answer vocabulary-in-context questions with instant explanations.",
    tone: "text-coral",
  },
  {
    icon: LineChart,
    title: "Progress you can see",
    description:
      "XP, streaks, mastery levels, weekly charts, and achievements show exactly how far you have come.",
    tone: "text-yellow",
  },
  {
    icon: Timer,
    title: "SAT Arena",
    description:
      "Timed mixed quizzes with real question types, per-question timing, and a full results breakdown.",
    tone: "text-violet",
  },
  {
    icon: GraduationCap,
    title: "Built for the SAT",
    description:
      "130 high-utility parts, 500+ example words, and 1000+ questions written for the Reading and Writing section.",
    tone: "text-turquoise",
  },
];

const stats = [
  { value: "130", label: "Roots, prefixes & suffixes" },
  { value: "500+", label: "Example words" },
  { value: "1000+", label: "Quiz questions" },
  { value: "12", label: "Interactive lessons" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ------------------------------------------------------------ hero -- */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        >
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-turquoise/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-coral/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div className="flex animate-fade-up flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-semibold text-violet">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              The vocabulary game for the SAT
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Decode difficult words.{" "}
              <span className="text-gradient">Unlock your SAT potential.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              RootQuest turns roots, prefixes, and suffixes into a personal word
              garden. Study with flashcards, learn the logic behind every word,
              and practice with SAT-style questions — all in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Start Learning <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/quiz/demo">
                <Button size="lg" variant="secondary">
                  Try a Sample Quiz
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted">
              Free to start · No account needed for the sample · Works on every device
            </p>
          </div>

          <div className="flex animate-scale-in justify-center lg:justify-end">
            <SampleCard />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ stats -- */}
      <section className="border-y border-border/60 bg-surface/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-4xl font-extrabold text-gradient">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- learning path -- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Your learning path
          </h2>
          <p className="max-w-2xl text-muted">
            Consistent study unlocks new areas of the RootQuest world. Every
            mastered part grows your garden a little more.
          </p>
        </div>
        <LearningPath />
      </section>

      {/* --------------------------------------------------------- features -- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Learn like a game, study like a scientist
          </h2>
          <p className="max-w-2xl text-muted">
            Every feature is designed around how memory actually works.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-all duration-300 hover:-translate-y-1 hover:border-violet/40"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-card">
                <feature.icon className={`h-6 w-6 ${feature.tone}`} aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA -- */}
      <section className="relative overflow-hidden border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <Card className="relative overflow-hidden border-violet/30 bg-gradient-to-br from-violet/15 via-card to-turquoise/10 p-10 text-center">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet/20 blur-3xl"
              aria-hidden="true"
            />
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold sm:text-4xl">
              Plant your first root today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Create a free account, set your daily goal, and let spaced repetition
              do the heavy lifting. Your future SAT score will thank you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Create your account <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/lesson/sample">
                <Button size="lg" variant="outline">
                  Explore a sample lesson
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
