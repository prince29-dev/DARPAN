import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Service: Network Health
 * ============================================================================
 *
 * A single 0-100 score composed from five weighted, independently
 * documented sub-scores. Every sub-score is a deterministic threshold
 * function of a real measurement already available elsewhere in the
 * platform — nothing here is machine-learned or random, and running it
 * twice against the same inputs always produces the same score.
 *
 * Weights (sum to 1.0):
 *   realtimeAvailability 25% · predictionHealth 20% · apiLatency 20%
 *   vehicleFreshness 20% · congestion 15%
 */

import type { AnalyticsOverview, NetworkHealth, NetworkHealthBand } from "@/types/analytics";
import type { RealtimeSnapshot } from "@/types/realtime";

const WEIGHTS = {
  realtimeAvailability: 0.25,
  predictionHealth: 0.2,
  apiLatency: 0.2,
  vehicleFreshness: 0.2,
  congestion: 0.15,
} as const;

function scoreLatency(latencyMs: number | null): number {
  if (latencyMs === null) return 0;
  if (latencyMs <= 500) return 100;
  if (latencyMs <= 1500) return 80;
  if (latencyMs <= 3000) return 60;
  if (latencyMs <= 6000) return 40;
  return 20;
}

function scoreFreshness(freshnessMs: number | null): number {
  if (freshnessMs === null) return 0;
  if (freshnessMs <= 20_000) return 100;
  if (freshnessMs <= 45_000) return 80;
  if (freshnessMs <= 90_000) return 50;
  if (freshnessMs <= 180_000) return 25;
  return 0;
}

function scoreCongestion(congestionIndex: number): number {
  // Inverted: higher network-wide congestion density lowers the score.
  return Math.round((1 - congestionIndex) * 100);
}

function bandFor(score: number): NetworkHealthBand {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 35) return "Poor";
  return "Critical";
}

export interface ComputeNetworkHealthInput {
  snapshot: RealtimeSnapshot;
  overview: AnalyticsOverview;
  predictionEngineOperational: boolean;
}

export function computeNetworkHealth({
  snapshot,
  overview,
  predictionEngineOperational,
}: ComputeNetworkHealthInput): NetworkHealth {
  const vehicleFreshnessMs = Date.now() - snapshot.fetchedAtMs;

  const breakdown = {
    realtimeAvailability: snapshot.vehicles.length > 0 ? 100 : 40,
    predictionHealth: predictionEngineOperational ? 100 : 0,
    apiLatency: scoreLatency(snapshot.upstreamLatencyMs),
    vehicleFreshness: scoreFreshness(vehicleFreshnessMs),
    congestion: scoreCongestion(overview.congestionIndex),
  };

  const score = Math.round(
    breakdown.realtimeAvailability * WEIGHTS.realtimeAvailability +
      breakdown.predictionHealth * WEIGHTS.predictionHealth +
      breakdown.apiLatency * WEIGHTS.apiLatency +
      breakdown.vehicleFreshness * WEIGHTS.vehicleFreshness +
      breakdown.congestion * WEIGHTS.congestion,
  );

  return {
    score,
    band: bandFor(score),
    breakdown,
    realtimeLatencyMs: snapshot.upstreamLatencyMs,
    vehicleFreshnessMs,
    generatedAtMs: Date.now(),
  };
}
