import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of RootQuest SAT.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 6, 2026</p>

      <Card className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">1. The service</h2>
          <p>
            RootQuest SAT is an interactive vocabulary-learning platform for SAT
            preparation. It provides lessons, flashcards, quizzes, spaced
            repetition, and progress tracking. Some features require a free
            account.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">2. Your account</h2>
          <p>
            You are responsible for keeping your password confidential and for all
            activity under your account. You must provide accurate information when
            registering. One person may not operate multiple accounts to abuse
            gamification features such as streaks or achievements.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">3. Acceptable use</h2>
          <p>
            Do not attempt to access other users' data, disrupt the service,
            scrape content at scale, or use the platform for any unlawful purpose.
            We may suspend accounts that violate these terms.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">4. Content</h2>
          <p>
            The word parts, example words, questions, and lessons provided by
            RootQuest are for your personal, non-commercial study. You may not
            redistribute or resell the content library.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">5. Disclaimers</h2>
          <p>
            RootQuest is a study aid, not a guarantee of any exam score. The
            service is provided “as is” without warranties of any kind. We work
            hard to keep content accurate, but vocabulary definitions and
            explanations may occasionally contain errors — report them via the{" "}
            <a href="/contact" className="text-turquoise hover:underline">
              contact page
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">6. Termination</h2>
          <p>
            You may delete your account at any time from Profile &amp; Settings.
            We may terminate access for accounts that violate these terms. Upon
            termination, your right to use the service ends.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">7. Contact</h2>
          <p>
            Questions about these terms can be sent through the{" "}
            <a href="/contact" className="text-turquoise hover:underline">
              contact page
            </a>
            .
          </p>
        </section>
      </Card>
    </div>
  );
}
