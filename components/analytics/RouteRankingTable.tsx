"use client";

import { CONGESTION_BADGE_VARIANT, CONGESTION_LABEL } from "@/components/analytics/analytics-visual-tokens";
import {
  PredictionEmptyState,
  PredictionErrorState,
  PredictionSkeleton,
} from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { useRouteAnalytics } from "@/hooks/use-analytics";
import type { RouteOperationalHealth } from "@/types/analytics";

const MAX_ROWS = 25;

const HEALTH_BADGE_VARIANT: Record<RouteOperationalHealth, "accent" | "signal" | "destructive"> = {
  healthy: "accent",
  watch: "signal",
  degraded: "destructive",
};

const HEALTH_LABEL: Record<RouteOperationalHealth, string> = {
  healthy: "Healthy",
  watch: "Watch",
  degraded: "Degraded",
};

function formatMinutes(seconds: number | null): string {
  if (seconds === null) return "—";
  return `${Math.round(seconds / 60)} min`;
}

/** Analytics Operations Center: per-route rankings (busiest first), from
 * the live feed's own route IDs — see /api/analytics/routes. */
export function RouteRankingTable() {
  const { data, loading, error, retry } = useRouteAnalytics();

  if (loading) return <PredictionSkeleton lines={6} className="p-4" />;
  if (error) return <PredictionErrorState message={error} onRetry={retry} />;
  if (!data || data.length === 0) {
    return (
      <PredictionEmptyState title="No live routes" description="No routes are currently reporting vehicles." />
    );
  }

  const rows = data.slice(0, MAX_ROWS);

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Route</th>
            <th className="py-2 pr-4 font-medium">Vehicles</th>
            <th className="py-2 pr-4 font-medium">Avg ETA</th>
            <th className="py-2 pr-4 font-medium">Avg Delay</th>
            <th className="py-2 pr-4 font-medium">Speed</th>
            <th className="py-2 pr-4 font-medium">Congestion</th>
            <th className="py-2 font-medium">Health</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((route) => (
            <tr key={route.routeId} className="border-b border-border/60 last:border-b-0">
              <td className="py-2.5 pr-4 font-mono text-foreground">{route.routeId}</td>
              <td className="py-2.5 pr-4 font-mono tabular-nums text-muted-foreground">{route.vehicleCount}</td>
              <td className="py-2.5 pr-4 font-mono tabular-nums text-muted-foreground">
                {formatMinutes(route.averageEtaSeconds)}
              </td>
              <td className="py-2.5 pr-4 font-mono tabular-nums text-muted-foreground">
                {formatMinutes(route.averageDelaySeconds)}
              </td>
              <td className="py-2.5 pr-4 font-mono tabular-nums text-muted-foreground">
                {route.averageSpeedKmh ? `${route.averageSpeedKmh.toFixed(1)} km/h` : "—"}
              </td>
              <td className="py-2.5 pr-4">
                <Badge variant={CONGESTION_BADGE_VARIANT[route.congestionLevel]}>
                  {CONGESTION_LABEL[route.congestionLevel]}
                </Badge>
              </td>
              <td className="py-2.5">
                <Badge variant={HEALTH_BADGE_VARIANT[route.operationalHealth]}>
                  {HEALTH_LABEL[route.operationalHealth]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
