"use client";

import { CONGESTION_BAR_CLASS, CONGESTION_LABEL } from "@/components/analytics/analytics-visual-tokens";
import {
  PredictionEmptyState,
  PredictionErrorState,
  PredictionSkeleton,
} from "@/components/dashboard/prediction-loading-states";
import { useRouteAnalytics } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

const MAX_ROUTES_SHOWN = 60;

/** Analytics Operations Center: a route-level congestion heatmap grid
 * (not a geographic heatmap — see the live map's own congestion overlay
 * for spatial density). Cell opacity scales with vehicle count so busy,
 * congested routes stand out immediately. */
export function CongestionHeatmap() {
  const { data, loading, error, retry } = useRouteAnalytics();

  if (loading) return <PredictionSkeleton lines={5} className="p-4" />;
  if (error) return <PredictionErrorState message={error} onRetry={retry} />;
  if (!data || data.length === 0) {
    return (
      <PredictionEmptyState title="No live routes" description="No routes are currently reporting vehicles." />
    );
  }

  const maxVehicles = Math.max(...data.map((r) => r.vehicleCount), 1);
  const routes = data.slice(0, MAX_ROUTES_SHOWN);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 xl:grid-cols-12">
        {routes.map((route) => {
          const opacity = 0.35 + 0.65 * (route.vehicleCount / maxVehicles);
          return (
            <div
              key={route.routeId}
              title={`Route ${route.routeId} · ${route.vehicleCount} vehicles · ${CONGESTION_LABEL[route.congestionLevel]}`}
              className={cn("aspect-square rounded-sm", CONGESTION_BAR_CLASS[route.congestionLevel])}
              style={{ opacity }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {(["low", "moderate", "high", "severe"] as const).map((level) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", CONGESTION_BAR_CLASS[level])} />
            {CONGESTION_LABEL[level]}
          </span>
        ))}
        <span className="ml-auto">
          {data.length.toLocaleString("en-IN")} live routes · opacity ∝ vehicle count
        </span>
      </div>
    </div>
  );
}
