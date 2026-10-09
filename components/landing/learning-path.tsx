import {
  Compass,
  FlaskConical,
  Flower2,
  Landmark,
  Swords,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stops = [
  {
    name: "Prefix Planet",
    description: "Directional and modifying prefixes",
    icon: Compass,
    color: "from-turquoise to-emerald-400",
  },
  {
    name: "Root Forest",
    description: "Classical roots and word families",
    icon: Flower2,
    color: "from-violet to-fuchsia-400",
  },
  {
    name: "Suffix City",
    description: "Endings that change meaning and grammar",
    icon: Landmark,
    color: "from-coral to-orange-400",
  },
  {
    name: "SAT Arena",
    description: "Timed practice with real questions",
    icon: Swords,
    color: "from-yellow to-amber-400",
  },
  {
    name: "Mastery Museum",
    description: "Achievements and collections you earn",
    icon: Trophy,
    color: "from-turquoise to-violet",
  },
];

/** Animated learning-path preview shown on the landing page. */
export function LearningPath() {
  return (
    <div className="relative">
      {/* Connecting path */}
      <svg
        viewBox="0 0 1000 120"
        className="absolute left-0 top-7 hidden h-6 w-full lg:block"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M 40 30 C 200 90, 320 90, 480 30 S 800 90, 960 30"
          fill="none"
          stroke="rgb(var(--violet) / 0.35)"
          strokeWidth="3"
          strokeDasharray="10 8"
          strokeLinecap="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-36"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stops.map((stop, index) => (
          <li
            key={stop.name}
            className="card-surface flex animate-fade-up flex-col items-center gap-2 p-5 text-center"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                stop.color
              )}
            >
              <stop.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-bold">{stop.name}</span>
            <span className="text-xs leading-snug text-muted">{stop.description}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
