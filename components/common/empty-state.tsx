import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-lg border border-border bg-surface-elevated">
        <Icon className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
