"use client";

import { Activity, Clock, Gauge, Route, TrendingDown, Zap } from "lucide-react";

import { formatSeconds, formatSignedSeconds } from "@/components/analytics/analytics-visual-tokens";
import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { StatCard, type StatCardStatus } from "@/components/dashboard/stat-card";
import { useAnalyticsOverview } from "@/hooks/use-analytics";

/** Overview + Analytics Operations Center: the full KPI tile grid. */
export function KPIGrid() {
  const { data, loading, error, retry } = useAnalyticsOverview();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-6">
            <PredictionSkeleton lines={2} />
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

  const status: StatCardStatus = !data || data.vehicleCount === 0 ? "pending" : "connected";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Vehicle Count"
        icon={Activity}
        status={status}
        value={data?.vehicleCount.toLocaleString("en-IN")}
        hint="Live vehicles currently analyzed."
      />
      <StatCard
        label="Average ETA"
        icon={Clock}
        status={status}
        value={formatSeconds(data?.averageEtaSeconds ?? null)}
        hint="Across all live vehicles."
      />
      <StatCard
        label="Average Delay"
        icon={TrendingDown}
        status={status}
        value={formatSignedSeconds(data?.averageDelaySeconds ?? null)}
        hint={
          data && data.delaySampleCount > 0
            ? `From ${data.delaySampleCount.toLocaleString("en-IN")} scheduled trips.`
            : "No scheduled trips currently live."
        }
      />
      <StatCard
        label="Congestion Index"
        icon={Gauge}
        status={status}
        value={data ? `${Math.round(data.congestionIndex * 100)}` : undefined}
        hint={`Mostly "${data?.dominantCongestionLevel ?? "low"}" right now.`}
      />
      <StatCard
        label="Average Speed"
        icon={Zap}
        status={status}
        value={data?.averageSpeedKmh ? `${data.averageSpeedKmh.toFixed(1)} km/h` : undefined}
        hint="Congestion-adjusted effective speed."
      />
      <StatCard
        label="Prediction Confidence"
        icon={Activity}
        status={status}
        value={data ? `${Math.round(data.predictionConfidence * 100)}%` : undefined}
        hint="Blend of ETA and delay confidence."
      />
      <StatCard
        label="Active Routes"
        icon={Route}
        status={status}
        value={data?.activeRoutes.toLocaleString("en-IN")}
        hint={`${data ? Math.round(data.routeUtilization * 100) : 0}% with 2+ vehicles reporting.`}
      />
      <StatCard
        label="Offline Routes"
        icon={Route}
        status="pending"
        value="N/A"
        hint="No static roster exists for the live feed's operator."
      />
    </div>
  );
}
