import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How RootQuest SAT collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 6, 2026</p>

      <Card className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">1. What we collect</h2>
          <p>
            When you create an account we collect your name, email address, and a
            securely hashed password. We also store your learning data: study
            sessions, quiz answers, word-part progress, saved words, achievements,
            and preferences such as your daily goal and timezone. If you contact us,
            we store your message.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">2. How we use it</h2>
          <p>
            Your data powers the product: scheduling your spaced-repetition reviews,
            calculating your progress and achievements, and personalizing your
            dashboard. We use aggregated, anonymized analytics to improve the
            platform. We do not sell your personal data.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">3. Security</h2>
          <p>
            Passwords are hashed with bcrypt and are never stored in plain text.
            Sessions are signed tokens stored in httpOnly cookies. All
            authorization checks happen on the server — your private data is only
            ever visible to you. Production traffic is served over HTTPS.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">4. Cookies</h2>
          <p>
            We use a single httpOnly session cookie to keep you logged in, and
            local browser storage to remember your theme preference. We do not use
            third-party advertising trackers.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">5. Your rights</h2>
          <p>
            You can view and edit your profile at any time, and you can permanently
            delete your account from Profile &amp; Settings. Deleting your account
            removes your profile, progress, sessions, and saved words. In-app
            reminders and report emails can be controlled from your settings.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">6. Children</h2>
          <p>
            RootQuest is designed for students preparing for the SAT. If you are
            under 13, please use RootQuest only with a parent or guardian's
            consent.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-text">7. Changes</h2>
          <p>
            We may update this policy as the product evolves. Material changes will
            be announced in the app. Questions? Visit the{" "}
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
