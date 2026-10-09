import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "violet" | "turquoise" | "coral" | "yellow" | "success" | "muted" | "default";

const tones: Record<Tone, string> = {
  default: "bg-violet/15 text-violet border-violet/30",
  violet: "bg-violet/15 text-violet border-violet/30",
  turquoise: "bg-turquoise/15 text-turquoise border-turquoise/30",
  coral: "bg-coral/15 text-coral border-coral/30",
  yellow: "bg-yellow/15 text-yellow border-yellow/30",
  success: "bg-success/15 text-success border-success/30",
  muted: "bg-card text-muted border-border",
};

export function Badge({
  className,
  tone = "default",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const partTypeTones: Record<string, Tone> = {
  prefix: "turquoise",
  root: "violet",
  suffix: "coral",
};

export function PartTypeBadge({ type }: { type: string }) {
  return (
    <Badge tone={partTypeTones[type] ?? "muted"}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
}

const difficultyTones: Record<string, Tone> = {
  beginner: "success",
  intermediate: "yellow",
  advanced: "coral",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <Badge tone={difficultyTones[difficulty] ?? "muted"}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
}

const statusTones: Record<string, Tone> = {
  published: "success",
  draft: "yellow",
  archived: "muted",
  new: "muted",
  learning: "turquoise",
  familiar: "violet",
  strong: "yellow",
  mastered: "success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTones[status] ?? "muted"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
