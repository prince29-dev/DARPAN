"use client";

import { Activity } from "lucide-react";

import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { usePredictionAggregate } from "@/hooks/use-prediction";
import type { CongestionLevel } from "@/types/congestion";

const CONGESTION_BADGE_VARIANT: Record<CongestionLevel, "accent" | "signal" | "destructive" | "outline"> = {
  low: "accent",
  moderate: "outline",
  high: "signal",
  severe: "destructive",
};

const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  low: "Low",
  moderate: "Medium",
  high: "High",
  severe: "Severe",
};

function formatMinutes(seconds: number | null): string {
  if (seconds === null) return "—";
  return `${Math.round(seconds / 60)} min`;
}

export interface PredictionSnapshotBannerProps {
  /** Short label for what this page's entities are, e.g. "stations", "routes". */
  scopeLabel: string;
}

/**
 * A network-wide (not per-entity) live prediction snapshot. The
 * Prediction Engine analyzes the live OTD bus feed, which has no shared
 * ID space with DMRC's static stations/routes (see Milestone 6's field
 * audit) — so rather than fabricate a per-station or per-route match,
 * this banner honestly presents current network-wide figures, wired to
 * the real Prediction API.
 */
export function PredictionSnapshotBanner({ scopeLabel }: PredictionSnapshotBannerProps) {
  const { data, loading, error, retry } = usePredictionAggregate();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-accent" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-medium text-foreground">Live Prediction Snapshot</p>
          <p className="text-xs text-muted-foreground">
            Network-wide, from the live vehicle feed — not matched to individual {scopeLabel} yet.
          </p>
        </div>
      </div>

      {loading && <PredictionSkeleton lines={1} className="w-48" />}
      {!loading && error && <PredictionErrorState message={error} onRetry={retry} className="py-0" />}
      {!loading && !error && data && (
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            ETA{" "}
            <span className="font-mono text-foreground">{formatMinutes(data.averageEtaSeconds)}</span>
          </span>
          <span className="text-muted-foreground">
            Delay{" "}
            <span className="font-mono text-foreground">{formatMinutes(data.averageDelaySeconds)}</span>
          </span>
          <Badge variant={CONGESTION_BADGE_VARIANT[data.dominantCongestionLevel]}>
            Congestion: {CONGESTION_LABEL[data.dominantCongestionLevel]}
          </Badge>
        </div>
      )}
    </div>
  );
}
