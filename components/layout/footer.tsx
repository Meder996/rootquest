import Link from "next/link";
import { Sprout } from "lucide-react";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/about", label: "How it works" },
      { href: "/lesson/sample", label: "Sample lesson" },
      { href: "/quiz/demo", label: "Try a sample quiz" },
      { href: "/auth/sign-up", label: "Start learning" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/learn", label: "Word-part library" },
      { href: "/progress", label: "Progress tracking" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-turquoise text-white">
                <Sprout className="h-5 w-5" aria-hidden="true" />
              </span>
              Root<span className="text-gradient">Quest</span>
            </Link>
            <p className="max-w-xs text-sm text-muted">
              Decode difficult words. Unlock your SAT potential — one root, prefix,
              and suffix at a time.
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-turquoise"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} RootQuest SAT. All rights reserved.</p>
          <p>Made for students who read between the lines.</p>
        </div>
      </div>
    </footer>
  );
}
