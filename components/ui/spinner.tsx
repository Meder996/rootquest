import { cn } from "@/lib/utils";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-10", className)} role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      {label && <span className="text-sm text-muted">{label}</span>}
    </div>
  );
}

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}
