"use client";

import { AlertOctagon, AlertTriangle, Info } from "lucide-react";

import {
  PredictionEmptyState,
  PredictionErrorState,
  PredictionSkeleton,
} from "@/components/dashboard/prediction-loading-states";
import { useInsights } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import type { InsightSeverity } from "@/types/analytics";

const SEVERITY_ICON: Record<InsightSeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

const SEVERITY_ROW_CLASS: Record<InsightSeverity, string> = {
  info: "border-border bg-surface text-muted-foreground",
  warning: "border-signal/30 bg-signal/10 text-signal",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
};

/** Analytics Operations Center + Overview: rule-based, deterministic
 * operational messages (no machine learning) as alert-style rows. */
export function AIInsights() {
  const { data, loading, error, retry } = useInsights();

  if (loading) return <PredictionSkeleton lines={4} className="p-4" />;
  if (error) return <PredictionErrorState message={error} onRetry={retry} />;
  if (!data || data.length === 0) {
    return <PredictionEmptyState title="No insights" description="Nothing to report yet." />;
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((entry) => {
        const Icon = SEVERITY_ICON[entry.severity];
        return (
          <div
            key={entry.id}
            className={cn(
              "flex items-start gap-3 rounded-md border px-3 py-2.5",
              SEVERITY_ROW_CLASS[entry.severity],
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide opacity-80">{entry.category}</p>
              <p className="mt-0.5 text-sm text-foreground">{entry.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
