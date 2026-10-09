"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Library,
  MessageSquare,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/word-parts", label: "Word Parts", icon: Library },
  { href: "/admin/words", label: "Words", icon: BookOpen },
  { href: "/admin/questions", label: "Questions", icon: FileQuestion },
  { href: "/admin/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="lg:sticky lg:top-6 lg:self-start">
      <ul className="flex flex-row flex-wrap gap-2 lg:flex-col">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-violet/15 text-violet"
                    : "text-muted hover:bg-card hover:text-text"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
