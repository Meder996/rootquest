import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/10 text-violet">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}
