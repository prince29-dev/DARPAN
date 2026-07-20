import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Service: Insight
 * ============================================================================
 *
 * Generates operational messages by evaluating an ordered list of
 * deterministic rules against already-computed analytics — no machine
 * learning, no randomness. The same overview/health/routes input always
 * produces the same insights, in the same order.
 */

import type {
  AIInsight,
  AnalyticsOverview,
  InsightSeverity,
  NetworkHealth,
  RouteAnalytics,
} from "@/types/analytics";
import type { VehiclePrediction } from "@/types/prediction";
import type { RealtimeVehicle } from "@/types/realtime";

const MAX_INSIGHTS = 8;
const LOW_CONFIDENCE_THRESHOLD = 0.4;
const HIGH_LATENCY_THRESHOLD_MS = 3000;
const STALE_FRESHNESS_THRESHOLD_MS = 90_000;
const NETWORK_WIDE_CONGESTION_THRESHOLD = 0.6;

let nextInsightSequence = 0;

function insight(severity: InsightSeverity, category: string, message: string): AIInsight {
  nextInsightSequence += 1;
  return {
    id: `insight-${nextInsightSequence}`,
    severity,
    category,
    message,
    generatedAtMs: Date.now(),
  };
}

export interface GenerateInsightsInput {
  overview: AnalyticsOverview;
  networkHealth: NetworkHealth;
  routes: RouteAnalytics[];
  predictions: VehiclePrediction[];
  vehicles: RealtimeVehicle[];
}

export function generateInsights({
  overview,
  networkHealth,
  routes,
  predictions,
  vehicles,
}: GenerateInsightsInput): AIInsight[] {
  const insights: AIInsight[] = [];

  if (networkHealth.band === "Critical" || networkHealth.band === "Poor") {
    insights.push(
      insight(
        networkHealth.band === "Critical" ? "critical" : "warning",
        "Network Health",
        `Network health is ${networkHealth.band} (score ${networkHealth.score}/100) — review the health breakdown for the affected component.`,
      ),
    );
  }

  if (overview.predictionConfidence < LOW_CONFIDENCE_THRESHOLD && overview.vehicleCount > 0) {
    insights.push(
      insight(
        "warning",
        "Prediction Engine",
        `Prediction confidence decreasing — currently ${Math.round(overview.predictionConfidence * 100)}%, reflecting limited signal (speed/bearing) in the live feed.`,
      ),
    );
  }

  const isStale =
    networkHealth.vehicleFreshnessMs !== null &&
    networkHealth.vehicleFreshnessMs > STALE_FRESHNESS_THRESHOLD_MS;
  const isSlow =
    networkHealth.realtimeLatencyMs !== null &&
    networkHealth.realtimeLatencyMs > HIGH_LATENCY_THRESHOLD_MS;
  if (isStale || isSlow) {
    insights.push(
      insight(
        "warning",
        "Realtime Engine",
        `Realtime feed delayed — ${isSlow ? `upstream latency ${networkHealth.realtimeLatencyMs}ms` : `data is ${Math.round((networkHealth.vehicleFreshnessMs ?? 0) / 1000)}s old`}.`,
      ),
    );
  }

  if (overview.congestionIndex > NETWORK_WIDE_CONGESTION_THRESHOLD) {
    insights.push(
      insight(
        "warning",
        "Congestion",
        `High congestion detected network-wide — density index at ${Math.round(overview.congestionIndex * 100)}/100 across ${overview.vehicleCount.toLocaleString("en-IN")} live vehicles.`,
      ),
    );
  }

  const worstRoute = routes.find((route) => route.congestionLevel === "severe");
  if (worstRoute) {
    insights.push(
      insight(
        "warning",
        "Route",
        `High congestion detected on Route ${worstRoute.routeId} — ${worstRoute.vehicleCount} vehicles reporting, severe density.`,
      ),
    );
  }

  const vehicleById = new Map(vehicles.map((v) => [v.entityId, v]));
  const densest = predictions.reduce<VehiclePrediction | null>((max, p) => {
    if (!max || p.congestion.nearbyVehicleCount > max.congestion.nearbyVehicleCount) return p;
    return max;
  }, null);
  if (densest && densest.congestion.nearbyVehicleCount >= 5) {
    const vehicle = vehicleById.get(densest.vehicleId);
    if (vehicle) {
      insights.push(
        insight(
          "info",
          "Density",
          `Heavy vehicle density near ${vehicle.position.lat.toFixed(3)}, ${vehicle.position.lon.toFixed(3)} — ${densest.congestion.nearbyVehicleCount} vehicles within ${densest.congestion.analysisRadiusKm} km.`,
        ),
      );
    }
  }

  if (insights.length === 0) {
    insights.push(insight("info", "Network", "Network operating normally — no anomalies detected."));
  }

  const severityRank: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return insights.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]).slice(0, MAX_INSIGHTS);
}
