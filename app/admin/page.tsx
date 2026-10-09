"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Library,
  MessageSquare,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

interface Stats {
  users: number;
  students: number;
  wordParts: number;
  publishedParts: number;
  draftParts: number;
  words: number;
  questions: number;
  publishedQuestions: number;
  lessons: number;
  studySessions: number;
  quizAttempts: number;
  openFeedback: number;
  totalXp: number;
}

interface FeedbackItem {
  id: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  user_email: string | null;
}

const toneClasses: Record<string, string> = {
  violet: "bg-violet/10 text-violet",
  turquoise: "bg-turquoise/10 text-turquoise",
  coral: "bg-coral/10 text-coral",
  yellow: "bg-yellow/10 text-yellow",
};

const cards: {
  key: keyof Stats;
  label: string;
  icon: typeof Users;
  href: string;
  tone: "violet" | "turquoise" | "coral" | "yellow";
}[] = [
  { key: "users", label: "Users", icon: Users, href: "/admin/users", tone: "violet" },
  { key: "wordParts", label: "Word parts", icon: Library, href: "/admin/word-parts", tone: "turquoise" },
  { key: "words", label: "Example words", icon: BookOpen, href: "/admin/words", tone: "turquoise" },
  { key: "questions", label: "Questions", icon: FileQuestion, href: "/admin/questions", tone: "coral" },
  { key: "lessons", label: "Lessons", icon: GraduationCap, href: "/admin/lessons", tone: "violet" },
  { key: "quizAttempts", label: "Completed quizzes", icon: BarChart3, href: "/admin/reports", tone: "yellow" },
  { key: "studySessions", label: "Study sessions", icon: BarChart3, href: "/admin/reports", tone: "yellow" },
  { key: "openFeedback", label: "Open feedback", icon: MessageSquare, href: "/admin/feedback", tone: "coral" },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then(setStats);
    fetch("/api/admin/feedback?status=new")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => setFeedback(data.feedback.slice(0, 5)));
  }, []);

  if (!stats) return <Spinner label="Loading admin stats…" className="py-24" />;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, href, tone }) => (
          <Link key={key} href={href} className="group">
            <Card className="flex items-center gap-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-violet/50">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-${tone}/10 text-${tone}`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold">
                  {stats[key].toLocaleString()}
                </p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-display text-xl font-extrabold">{stats.publishedParts}</p>
          <p className="text-xs text-muted">published word parts · {stats.draftParts} drafts</p>
        </Card>
        <Card>
          <p className="font-display text-xl font-extrabold">{stats.publishedQuestions}</p>
          <p className="text-xs text-muted">published questions · {stats.questions - stats.publishedQuestions} not published</p>
        </Card>
        <Card>
          <p className="font-display text-xl font-extrabold">{stats.totalXp.toLocaleString()}</p>
          <p className="text-xs text-muted">total XP earned by all students</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">New feedback</h2>
          <Link
            href="/admin/feedback"
            className="text-sm font-semibold text-turquoise hover:underline"
          >
            View all
          </Link>
        </div>
        {feedback.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No new feedback. Inbox zero.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {feedback.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {item.subject || "Feedback"}
                  </span>
                  <Badge tone="yellow">{item.status}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted">{item.message}</p>
                <p className="mt-2 text-xs text-muted">
                  {item.user_email ?? "Anonymous"} · {formatDate(item.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
