import { cn } from "@/lib/utils";

export interface WeeklyPoint {
  date: string;
  reviews: number;
  xp: number;
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Bar chart of the last 7 days of study activity (pure SVG, no JS). */
export function WeeklyChart({ data }: { data: WeeklyPoint[] }) {
  const maxReviews = Math.max(1, ...data.map((d) => d.reviews));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-36 items-end gap-2 sm:gap-3" role="img" aria-label="Reviews per day for the last 7 days">
        {data.map((point) => {
          const heightPct = Math.round((point.reviews / maxReviews) * 100);
          const date = new Date(point.date + "T00:00:00Z");
          const isToday = point.date === today;
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-muted">{point.reviews}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    point.reviews > 0
                      ? isToday
                        ? "bg-gradient-to-t from-violet to-turquoise"
                        : "bg-violet/50"
                      : "bg-card"
                  )}
                  style={{ height: `${Math.max(point.reviews > 0 ? heightPct : 4, 4)}%` }}
                  title={`${point.date}: ${point.reviews} reviews, ${point.xp} XP`}
                />
              </div>
              <span
                className={cn(
                  "text-xs",
                  isToday ? "font-bold text-turquoise" : "text-muted"
                )}
              >
                {dayLabels[date.getUTCDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
