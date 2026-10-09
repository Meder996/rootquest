import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-card border border-border"
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-violet to-turquoise transition-all duration-500",
            barClassName
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
