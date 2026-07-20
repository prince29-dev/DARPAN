"use client";

import dynamic from "next/dynamic";

import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { useTrends } from "@/hooks/use-analytics";

const TrendChartBody = dynamic(() => import("@/components/analytics/trend-chart-body"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4">
          <PredictionSkeleton lines={3} />
        </div>
      ))}
    </div>
  ),
});

/** Overview + Analytics Operations Center: Vehicle/ETA/Delay/Congestion/
 * Prediction/Speed/Latency trend charts, from the in-memory rolling
 * history at /api/analytics/trends. */
export function TrendCharts() {
  const { data, loading, error, retry } = useTrends();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <PredictionSkeleton lines={3} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-surface">
        <PredictionErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  if (!data) return null;

  return <TrendChartBody series={data} />;
}
