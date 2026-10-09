import {
  Award,
  BookOpenCheck,
  Bookmark,
  Building2,
  CalendarCheck,
  Flame,
  Sprout,
  Target,
  Telescope,
  Trees,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  Sprout,
  Telescope,
  Trees,
  Building2,
  Flame,
  Target,
  Trophy,
  BookOpenCheck,
  Wrench,
  Bookmark,
  CalendarCheck,
};

export function AchievementIcon({
  icon,
  earned,
  className,
}: {
  icon: string;
  earned: boolean;
  className?: string;
}) {
  const Icon = icons[icon] ?? Award;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl",
        earned
          ? "bg-gradient-to-br from-violet to-turquoise text-white shadow-glow"
          : "bg-card text-muted/50",
        className
      )}
      aria-hidden="true"
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}
