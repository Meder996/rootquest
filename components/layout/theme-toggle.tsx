"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add("light");
      localStorage.setItem("rq-theme", "light");
    } else {
      root.classList.remove("light");
      localStorage.setItem("rq-theme", "dark");
    }
  }

  if (!mounted) {
    return <div className={cn("h-9 w-9", className)} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted",
        "transition-colors hover:border-violet hover:text-violet",
        className
      )}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
