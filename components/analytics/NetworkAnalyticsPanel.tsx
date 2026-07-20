"use client";

import { Activity } from "lucide-react";

import { HEALTH_BAND_BADGE_VARIANT } from "@/components/analytics/analytics-visual-tokens";
import { PredictionErrorState, PredictionSkeleton } from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { useAnalyticsOverview, useNetworkHealth } from "@/hooks/use-analytics";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

/**
 * Compact live network analytics composite — Network Health score plus a
 * few headline KPIs. Named `NetworkAnalyticsPanel` per the Milestone 8
 * brief; distinct from `components/network/network-analytics-panel.tsx`
 * (Milestone 5's static GTFS structural counts) and
 * `components/network/network-prediction-panel.tsx` (Milestone 7 Phase 2's
 * congestion-only badges) — import with an alias wherever more than one
 * is used in the same file.
 */
export function NetworkAnalyticsPanel() {
  const health = useNetworkHealth();
  const overview = useAnalyticsOverview();

  const loading = health.loading || overview.loading;
  const error = health.error ?? overview.error;
  const retry = () => {
    health.retry();
    overview.retry();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
          Live Network Analytics
        </p>
        {health.data && (
          <Badge variant={HEALTH_BAND_BADGE_VARIANT[health.data.band]} className="gap-1">
            <Activity className="size-3" strokeWidth={1.75} />
            {health.data.band}
          </Badge>
        )}
      </div>

      {loading && <PredictionSkeleton lines={3} />}
      {!loading && error && <PredictionErrorState message={error} onRetry={retry} className="py-2" />}

      {!loading && !error && health.data && overview.data && (
        <div className="flex flex-col">
          <Row label="Health score" value={`${health.data.score} / 100`} />
          <Row label="Vehicles" value={overview.data.vehicleCount.toLocaleString("en-IN")} />
          <Row label="Active routes" value={overview.data.activeRoutes.toLocaleString("en-IN")} />
          <Row label="Congestion index" value={`${Math.round(overview.data.congestionIndex * 100)}`} />
        </div>
      )}
    </div>
  );
}
