import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayKey(timezone = "UTC"): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Human-friendly relative time, e.g. "due in 5 min" / "due in 3 days". */
export function formatRelativeDue(iso: string | null | undefined): string {
  if (!iso) return "not scheduled";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "not scheduled";
  const diffMs = date.getTime() - Date.now();
  const absMin = Math.round(Math.abs(diffMs) / 60000);
  const past = diffMs < 0;
  let text: string;
  if (absMin < 1) text = "1 min";
  else if (absMin < 60) text = `${absMin} min`;
  else if (absMin < 60 * 24) {
    const hours = Math.round(absMin / 60);
    text = `${hours} hr`;
  } else {
    const days = Math.round(absMin / (60 * 24));
    text = days === 1 ? "1 day" : `${days} days`;
  }
  return past ? `overdue by ${text}` : `due in ${text}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function xpLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % 500;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Deterministic pseudo-random pick helpers (seeded content generation). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
