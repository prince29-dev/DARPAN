"use client";

import { AlertTriangle, CheckCircle2, type Info } from "lucide-react";

import {
  PredictionEmptyState,
  PredictionErrorState,
  PredictionSkeleton,
} from "@/components/dashboard/prediction-loading-states";
import { useInsights } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import type { InsightSeverity } from "@/types/analytics";

const SEVERITY_ICON: Record<InsightSeverity, typeof Info> = {
  info: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

const SEVERITY_DOT_CLASS: Record<InsightSeverity, string> = {
  info: "bg-accent",
  warning: "bg-signal",
  critical: "bg-destructive",
};

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-IN", { hour12: false });
}

/** Analytics Operations Center: a vertical timeline of the current
 * deterministic AI Insights, styled as an ops-center event log. */
export function OperationsTimeline() {
  const { data, loading, error, retry } = useInsights();

  if (loading) return <PredictionSkeleton lines={5} className="p-4" />;
  if (error) return <PredictionErrorState message={error} onRetry={retry} />;
  if (!data || data.length === 0) {
    return <PredictionEmptyState title="No events" description="Nothing to report yet." />;
  }

  return (
    <ol className="flex flex-col gap-0">
      {data.map((entry, index) => {
        const Icon = SEVERITY_ICON[entry.severity];
        const isLast = index === data.length - 1;
        return (
          <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span className="absolute left-[9px] top-5 h-full w-px bg-border" aria-hidden="true" />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-[19px] shrink-0 items-center justify-center rounded-full",
                SEVERITY_DOT_CLASS[entry.severity],
              )}
            >
              <Icon className="size-3 text-background" strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {entry.category}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {formatTime(entry.generatedAtMs)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-foreground">{entry.message}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
