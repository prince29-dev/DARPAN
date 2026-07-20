import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardStatus = "connected" | "pending" | "offline" | "degraded";

const STATUS_LABEL: Record<StatCardStatus, string> = {
  connected: "Connected",
  pending: "Awaiting engine",
  offline: "Offline",
  degraded: "Degraded",
};

const STATUS_VARIANT: Record<StatCardStatus, "outline" | "signal" | "accent" | "destructive"> = {
  connected: "accent",
  pending: "outline",
  offline: "outline",
  degraded: "signal",
};

export interface StatCardProps {
  label: string;
  icon: LucideIcon;
  status: StatCardStatus;
  hint: string;
  value?: string;
  className?: string;
}

export function StatCard({ label, icon: Icon, status, hint, value, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between", className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex size-8 items-center justify-center rounded-md border border-border bg-surface-elevated">
          <Icon className="size-4 text-accent" strokeWidth={1.75} />
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <span
          className={cn(
            "font-display text-3xl font-semibold tabular-nums",
            value ? "text-foreground" : "text-muted-foreground/40",
          )}
        >
          {value ?? "—"}
        </span>
        <Badge variant={STATUS_VARIANT[status]} className="shrink-0">
          {STATUS_LABEL[status]}
        </Badge>
      </CardContent>
      <p className="px-6 pb-4 text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}
