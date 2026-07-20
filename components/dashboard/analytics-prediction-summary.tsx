"use client";

import { Sparkles } from "lucide-react";

import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePredictionAggregate } from "@/hooks/use-prediction";
import type { CongestionLevel } from "@/types/congestion";

const CONGESTION_ORDER: CongestionLevel[] = ["low", "moderate", "high", "severe"];

const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  low: "Low",
  moderate: "Medium",
  high: "High",
  severe: "Severe",
};

const CONGESTION_BAR_CLASS: Record<CongestionLevel, string> = {
  low: "bg-accent",
  moderate: "bg-foreground",
  high: "bg-signal",
  severe: "bg-destructive",
};

function formatMinutes(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

/** Analytics page item 7: Prediction Summary. */
export function AnalyticsPredictionSummary() {
  const { data, loading, error, retry } = usePredictionAggregate();

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-10 items-center justify-center rounded-md border border-border bg-surface-elevated">
          <Sparkles className="size-5 text-accent" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <CardTitle>Prediction Summary</CardTitle>
          <CardDescription>
            Live from the Prediction Engine (Milestone 7) — deterministic, not machine-learned.
          </CardDescription>
        </div>
        <Badge variant={loading ? "outline" : error ? "destructive" : "accent"}>
          {loading ? "Loading" : error ? "Error" : "Live"}
        </Badge>
      </CardHeader>

      {loading && <PredictionSkeleton lines={4} className="px-6 pb-6" />}
      {!loading && error && <PredictionErrorState message={error} onRetry={retry} className="px-6 pb-6" />}

      {!loading && !error && data && (
        <div className="flex flex-col gap-6 px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric label="Vehicles analyzed" value={data.vehiclesAnalyzed.toLocaleString("en-IN")} />
            <Metric label="Average ETA" value={formatMinutes(data.averageEtaSeconds)} />
            <Metric label="Average delay" value={formatMinutes(data.averageDelaySeconds)} />
            <Metric label="Prediction confidence" value={`${Math.round(data.averageConfidence * 100)}%`} />
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Congestion distribution</p>
            <div className="flex flex-col gap-1.5">
              {CONGESTION_ORDER.map((level) => {
                const count = data.congestionCounts[level];
                const pct = data.vehiclesAnalyzed > 0 ? (count / data.vehiclesAnalyzed) * 100 : 0;
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">
                      {CONGESTION_LABEL[level]}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className={`h-full ${CONGESTION_BAR_CLASS[level]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
