import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Service: KPI
 * ============================================================================
 *
 * Pure aggregation over an already-computed set of `VehiclePrediction`s
 * (Milestone 7's `PredictionEngine.predictBatch()` — never re-implemented
 * here). No new fetching, no new prediction logic — this file only
 * reduces predictions into the headline KPI numbers the Operations
 * Center displays.
 *
 * "Active routes" / "route utilization" are computed within the live
 * feed's own route-ID space only. "Offline routes" is intentionally
 * `null` — there is no published static roster for the live feed's
 * operator to compare against, so "how many are offline" isn't a
 * knowable number (see `types/analytics.ts`).
 */

import type { CongestionAssessment, CongestionLevel } from "@/types/congestion";
import type { AnalyticsOverview } from "@/types/analytics";
import type { VehiclePrediction } from "@/types/prediction";

const MIN_VEHICLES_FOR_UTILIZED_ROUTE = 2;

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function dominantCongestionLevel(congestions: CongestionAssessment[]): CongestionLevel {
  const counts: Record<CongestionLevel, number> = { low: 0, moderate: 0, high: 0, severe: 0 };
  for (const c of congestions) counts[c.level] += 1;

  let best: CongestionLevel = "low";
  let bestCount = -1;
  for (const level of ["low", "moderate", "high", "severe"] as const) {
    if (counts[level] > bestCount) {
      bestCount = counts[level];
      best = level;
    }
  }
  return best;
}

/** Computes network-wide KPIs from a batch of Prediction Engine results. */
export function computeOverview(predictions: VehiclePrediction[]): AnalyticsOverview {
  const etaSeconds = predictions.map((p) => p.eta.etaSeconds);
  const delaySeconds = predictions
    .map((p) => p.delay.predictedDelaySeconds)
    .filter((s): s is number => s !== null);
  const speeds = predictions.map((p) => p.eta.effectiveSpeedKmh);
  const confidences = predictions.map((p) => p.overallConfidence);
  const congestions = predictions.map((p) => p.congestion);
  const densityScores = congestions.map((c) => c.densityScore);

  const routeVehicleCounts = new Map<string, number>();
  for (const p of predictions) {
    if (!p.routeId) continue;
    routeVehicleCounts.set(p.routeId, (routeVehicleCounts.get(p.routeId) ?? 0) + 1);
  }

  const activeRoutes = routeVehicleCounts.size;
  const utilizedRoutes = Array.from(routeVehicleCounts.values()).filter(
    (count) => count >= MIN_VEHICLES_FOR_UTILIZED_ROUTE,
  ).length;

  return {
    vehicleCount: predictions.length,
    averageEtaSeconds: average(etaSeconds),
    averageDelaySeconds: average(delaySeconds),
    delaySampleCount: delaySeconds.length,
    congestionIndex: average(densityScores) ?? 0,
    dominantCongestionLevel: dominantCongestionLevel(congestions),
    averageSpeedKmh: average(speeds),
    predictionConfidence: average(confidences) ?? 0,
    activeRoutes,
    offlineRoutes: null,
    routeUtilization: activeRoutes > 0 ? utilizedRoutes / activeRoutes : 0,
    generatedAtMs: Date.now(),
  };
}
