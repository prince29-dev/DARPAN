"use client";

import { Gauge } from "lucide-react";

import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { usePredictionAggregate } from "@/hooks/use-prediction";
import type { CongestionLevel } from "@/types/congestion";

const CONGESTION_ORDER: CongestionLevel[] = ["low", "moderate", "high", "severe"];

const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  low: "Low",
  moderate: "Medium",
  high: "High",
  severe: "Severe",
};

const CONGESTION_BADGE_VARIANT: Record<CongestionLevel, "accent" | "signal" | "destructive" | "outline"> = {
  low: "accent",
  moderate: "outline",
  high: "signal",
  severe: "destructive",
};

/**
 * Network page item 6: live congestion level badges. Sourced from
 * `CongestionAssessment`, the one Prediction Engine domain derived from a
 * real measurement (live-vehicle spatial density) rather than a seeded
 * placeholder — see Milestone 7 Phase 1's `congestion.service.ts`.
 */
export function NetworkPredictionPanel() {
  const { data, loading, error, retry } = usePredictionAggregate();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
        Live Congestion (Prediction Engine)
      </p>

      {loading && <PredictionSkeleton lines={2} />}
      {!loading && error && <PredictionErrorState message={error} onRetry={retry} className="py-2" />}

      {!loading && !error && data && (
        <>
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-accent" strokeWidth={1.75} />
            <Badge variant={CONGESTION_BADGE_VARIANT[data.dominantCongestionLevel]}>
              {CONGESTION_LABEL[data.dominantCongestionLevel]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              across {data.vehiclesAnalyzed.toLocaleString("en-IN")} live vehicles
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CONGESTION_ORDER.map((level) => (
              <Badge key={level} variant="outline" className="gap-1">
                {CONGESTION_LABEL[level]}
                <span className="font-mono tabular-nums text-muted-foreground">
                  {data.congestionCounts[level]}
                </span>
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
