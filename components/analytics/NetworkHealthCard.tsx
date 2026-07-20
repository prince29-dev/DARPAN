"use client";

import { Activity } from "lucide-react";

import {
  HEALTH_BAND_BADGE_VARIANT,
  HEALTH_BAND_BAR_CLASS,
} from "@/components/analytics/analytics-visual-tokens";
import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetworkHealth } from "@/hooks/use-analytics";

const BREAKDOWN_LABEL = {
  realtimeAvailability: "Realtime availability",
  predictionHealth: "Prediction health",
  apiLatency: "API latency",
  vehicleFreshness: "Vehicle freshness",
  congestion: "Congestion",
} as const;

/** Overview page + Analytics Operations Center: the headline 0-100 network health score. */
export function NetworkHealthCard() {
  const { data, loading, error, retry } = useNetworkHealth();

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4 text-accent" strokeWidth={1.75} />
            Network Health
          </CardTitle>
          <CardDescription>Deterministic 0-100 composite score (Milestone 8).</CardDescription>
        </div>
        {data && <Badge variant={HEALTH_BAND_BADGE_VARIANT[data.band]}>{data.band}</Badge>}
      </CardHeader>

      {loading && <PredictionSkeleton lines={4} className="px-6 pb-6" />}
      {!loading && error && <PredictionErrorState message={error} onRetry={retry} className="px-6 pb-6" />}

      {!loading && !error && data && (
        <div className="flex flex-col gap-5 px-6 pb-6">
          <div className="flex items-end gap-3">
            <span className="font-display text-4xl font-semibold tabular-nums text-foreground">
              {data.score}
            </span>
            <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
          </div>

          <div className="flex flex-col gap-2">
            {(Object.keys(BREAKDOWN_LABEL) as (keyof typeof BREAKDOWN_LABEL)[]).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-muted-foreground">
                  {BREAKDOWN_LABEL[key]}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className={`h-full ${HEALTH_BAND_BAR_CLASS[data.band]}`}
                    style={{ width: `${data.breakdown[key]}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {data.breakdown[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
