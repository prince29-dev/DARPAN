import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Service: Route Analytics
 * ============================================================================
 *
 * Groups an already-computed batch of `VehiclePrediction`s by their real
 * `routeId` (the live feed's own bus route IDs) and reduces each group
 * into a ranking row. Sorted by vehicle count descending by default —
 * busiest routes first, matching how an operations center would triage.
 */

import type { RouteAnalytics, RouteOperationalHealth } from "@/types/analytics";
import type { CongestionLevel } from "@/types/congestion";
import type { VehiclePrediction } from "@/types/prediction";

const CONGESTION_RANK: Record<CongestionLevel, number> = { low: 0, moderate: 1, high: 2, severe: 3 };

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function worstCongestion(levels: CongestionLevel[]): CongestionLevel {
  return levels.reduce<CongestionLevel>(
    (worst, level) => (CONGESTION_RANK[level] > CONGESTION_RANK[worst] ? level : worst),
    "low",
  );
}

function classifyHealth(delaySeconds: number | null, congestion: CongestionLevel): RouteOperationalHealth {
  if (congestion === "severe" || (delaySeconds !== null && delaySeconds > 300)) return "degraded";
  if (congestion === "high" || (delaySeconds !== null && delaySeconds > 120)) return "watch";
  return "healthy";
}

/** Computes per-route rankings, sorted by vehicle count (busiest first). */
export function computeRouteAnalytics(predictions: VehiclePrediction[]): RouteAnalytics[] {
  const byRoute = new Map<string, VehiclePrediction[]>();

  for (const prediction of predictions) {
    if (!prediction.routeId) continue;
    const bucket = byRoute.get(prediction.routeId);
    if (bucket) {
      bucket.push(prediction);
    } else {
      byRoute.set(prediction.routeId, [prediction]);
    }
  }

  const rows: RouteAnalytics[] = [];

  for (const [routeId, group] of byRoute) {
    const delaySeconds = group
      .map((p) => p.delay.predictedDelaySeconds)
      .filter((s): s is number => s !== null);
    const etaSeconds = group.map((p) => p.eta.etaSeconds);
    const speeds = group.map((p) => p.eta.effectiveSpeedKmh);
    const congestionLevel = worstCongestion(group.map((p) => p.congestion.level));
    const averageDelaySeconds = average(delaySeconds);

    rows.push({
      routeId,
      vehicleCount: group.length,
      averageDelaySeconds,
      averageEtaSeconds: average(etaSeconds),
      congestionLevel,
      averageSpeedKmh: average(speeds),
      operationalHealth: classifyHealth(averageDelaySeconds, congestionLevel),
    });
  }

  return rows.sort((a, b) => b.vehicleCount - a.vehicleCount);
}
