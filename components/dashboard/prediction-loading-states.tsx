"use client";

import { AlertTriangle, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PredictionSkeletonProps {
  lines?: number;
  className?: string;
}

/** Generic loading skeleton for any prediction card/panel/row. */
export function PredictionSkeleton({ lines = 3, className }: PredictionSkeletonProps) {
  return (
    <div className={cn("flex animate-pulse flex-col gap-2", className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 rounded bg-surface-elevated"
          style={{ width: `${78 - index * 12}%` }}
        />
      ))}
    </div>
  );
}

export interface PredictionErrorStateProps {
  message: string;
  onRetry: () => void;
  className?: string;
}

/** Error state with a Retry action — used any time a prediction fetch fails. */
export function PredictionErrorState({ message, onRetry, className }: PredictionErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-6 text-center", className)}>
      <AlertTriangle className="size-5 text-destructive" strokeWidth={1.75} />
      <p className="max-w-xs text-xs text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export interface PredictionEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

/** Empty state — used when a prediction fetch succeeds but returns nothing. */
export function PredictionEmptyState({
  title = "No live prediction data",
  description = "The Prediction Engine has no vehicles to analyze right now.",
  className,
}: PredictionEmptyStateProps) {
  return (
    <div className={cn("py-4", className)}>
      <EmptyState icon={Sparkles} title={title} description={description} />
    </div>
  );
}
