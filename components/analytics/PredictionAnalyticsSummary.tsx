"use client";

import { Sparkles } from "lucide-react";

import { formatSeconds } from "@/components/analytics/analytics-visual-tokens";
import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsOverview } from "@/hooks/use-analytics";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

/**
 * Analytics Operations Center: Prediction Engine summary sourced from the
 * Analytics Engine's server-computed overview (`kpi.service.ts`), so this
 * and every other Operations Center panel agree on one number for
 * "average ETA" etc. rather than each re-aggregating client-side.
 */
export function PredictionAnalyticsSummary() {
  const { data, loading, error, retry } = useAnalyticsOverview();

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-10 items-center justify-center rounded-md border border-border bg-surface-elevated">
          <Sparkles className="size-5 text-accent" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <CardTitle>Prediction Analytics Summary</CardTitle>
          <CardDescription>Server-computed by the Analytics Engine (Milestone 8).</CardDescription>
        </div>
        <Badge variant={loading ? "outline" : error ? "destructive" : "accent"}>
          {loading ? "Loading" : error ? "Error" : "Live"}
        </Badge>
      </CardHeader>

      {loading && <PredictionSkeleton lines={3} className="px-6 pb-6" />}
      {!loading && error && <PredictionErrorState message={error} onRetry={retry} className="px-6 pb-6" />}

      {!loading && !error && data && (
        <div className="grid grid-cols-2 gap-4 px-6 pb-6 sm:grid-cols-4">
          <Metric label="Vehicles analyzed" value={data.vehicleCount.toLocaleString("en-IN")} />
          <Metric label="Average ETA" value={formatSeconds(data.averageEtaSeconds)} />
          <Metric label="Average delay" value={formatSeconds(data.averageDelaySeconds)} />
          <Metric label="Prediction confidence" value={`${Math.round(data.predictionConfidence * 100)}%`} />
        </div>
      )}
    </Card>
  );
}
