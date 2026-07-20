"use client";

import { Clock, Gauge, TrendingDown } from "lucide-react";

import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { StatCard, type StatCardStatus } from "@/components/dashboard/stat-card";
import { usePredictionAggregate } from "@/hooks/use-prediction";

function formatSeconds(seconds: number | null): string | undefined {
  if (seconds === null) return undefined;
  const minutes = Math.round(seconds / 60);
  return minutes === 0 ? "<1 min" : `${minutes} min`;
}

function formatSignedSeconds(seconds: number | null): string | undefined {
  if (seconds === null) return undefined;
  const minutes = Math.round(seconds / 60);
  const sign = minutes > 0 ? "+" : "";
  return `${sign}${minutes} min`;
}

/** Overview page item 3: Average ETA / Average Delay / Congestion Index. */
export function PredictionOverviewCards() {
  const { data, loading, error, retry } = usePredictionAggregate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-6">
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

  const status: StatCardStatus = !data || data.vehiclesAnalyzed === 0 ? "pending" : "connected";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Average ETA"
        icon={Clock}
        status={status}
        value={formatSeconds(data?.averageEtaSeconds ?? null)}
        hint={`Across ${data?.vehiclesAnalyzed.toLocaleString("en-IN") ?? 0} live vehicles analyzed.`}
      />
      <StatCard
        label="Average Delay"
        icon={TrendingDown}
        status={status}
        value={formatSignedSeconds(data?.averageDelaySeconds ?? null)}
        hint={
          data && data.delaySampleCount > 0
            ? `From ${data.delaySampleCount.toLocaleString("en-IN")} scheduled trips.`
            : "No scheduled trips currently live to measure."
        }
      />
      <StatCard
        label="Congestion Index"
        icon={Gauge}
        status={status}
        value={data ? `${Math.round(data.congestionIndex * 100)}` : undefined}
        hint={`Network mostly "${data?.dominantCongestionLevel ?? "low"}" right now.`}
      />
    </div>
  );
}
