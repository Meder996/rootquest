"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Sprout,
  Trophy,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

interface NavUser {
  name: string;
  email: string;
  role: string;
}

const studentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: Library },
  { href: "/study/flashcards", label: "Study", icon: BookOpen },
  { href: "/quiz", label: "Quiz", icon: GraduationCap },
  { href: "/progress", label: "Progress", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-turquoise text-white shadow-glow">
            <Sprout className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">
            Root<span className="text-gradient">Quest</span>
          </span>
        </Link>

        {/* Desktop student links */}
        {user && (
          <div className="hidden items-center gap-1 lg:flex">
            {studentLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-violet/15 text-violet"
                    : "text-muted hover:bg-card hover:text-text"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:border-violet/50"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet/15 text-violet">
                  <UserIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-card"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    <p className="text-xs font-semibold capitalize text-turquoise">
                      {user.role}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-card-hover"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    href="/saved"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-card-hover"
                  >
                    <BookOpen className="h-4 w-4" /> Saved words
                  </Link>
                  <Link
                    href="/achievements"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-card-hover"
                  >
                    <Trophy className="h-4 w-4" /> Achievements
                  </Link>
                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-card-hover"
                  >
                    <UserIcon className="h-4 w-4" /> Profile &amp; settings
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-yellow hover:bg-card-hover"
                    >
                      <Sprout className="h-4 w-4" /> Admin console
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-coral hover:bg-card-hover"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/log-in">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">Start learning</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border/60 bg-surface px-4 py-4 lg:hidden">
          {user ? (
            <div className="flex flex-col gap-1">
              {studentLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    isActive(href)
                      ? "bg-violet/15 text-violet"
                      : "text-muted hover:bg-card hover:text-text"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}
              <Link
                href="/saved"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-card hover:text-text"
              >
                <BookOpen className="h-4 w-4" /> Saved words
              </Link>
              <Link
                href="/achievements"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-card hover:text-text"
              >
                <Trophy className="h-4 w-4" /> Achievements
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-card hover:text-text"
              >
                <UserIcon className="h-4 w-4" /> Profile &amp; settings
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-yellow"
                >
                  <Sprout className="h-4 w-4" /> Admin console
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-coral"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/auth/log-in">
                <Button variant="secondary" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="w-full">Start learning</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
