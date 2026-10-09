import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "RootQuest SAT — Decode difficult words. Unlock your SAT potential.",
    template: "%s | RootQuest SAT",
  },
  description:
    "Learn SAT roots, prefixes, suffixes, and academic vocabulary through interactive lessons, flashcards, spaced repetition, quizzes, and progress tracking.",
  keywords: [
    "SAT vocabulary",
    "SAT roots prefixes suffixes",
    "spaced repetition",
    "vocabulary quiz",
    "SAT prep",
  ],
  openGraph: {
    title: "RootQuest SAT — Decode difficult words. Unlock your SAT potential.",
    description:
      "An interactive platform for learning SAT roots, prefixes, suffixes, and academic vocabulary.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070A20",
};

/** Applies the saved theme before first paint to avoid a flash. */
const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem("rq-theme");
    if (theme === "light" || (!theme && window.matchMedia("(prefers-color-scheme: light)").matches)) {
      document.documentElement.classList.add("light");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-violet focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
