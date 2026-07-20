/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Domain: Analytics Engine
 * ============================================================================
 *
 * The Analytics Engine computes operational intelligence entirely from
 * data the platform already has: the Realtime Engine's live vehicle feed
 * (Milestone 6) and the Prediction Engine's deterministic ETA/delay/
 * congestion output (Milestone 7). Nothing here is machine-learned or
 * randomly generated — every score is a documented, deterministic
 * function of real inputs. See `services/analytics/` for the
 * implementations and `docs/ARCHITECTURE.md` § Milestone 8 for the
 * scoring formulas.
 *
 * As with Milestone 7, "routes" analyzed here are the live OTD feed's own
 * routes (bus route IDs), not DMRC's static metro routes — the two have
 * no shared ID space (established in Milestone 6).
 */

import type { CongestionLevel } from "@/types/congestion";

// ---------------------------------------------------------------------------
// Overview / KPIs
// ---------------------------------------------------------------------------

export interface AnalyticsOverview {
  vehicleCount: number;
  averageEtaSeconds: number | null;
  averageDelaySeconds: number | null;
  delaySampleCount: number;
  congestionIndex: number;
  dominantCongestionLevel: CongestionLevel;
  averageSpeedKmh: number | null;
  predictionConfidence: number;
  activeRoutes: number;
  /** Null: the live feed has no published static route roster to compare
   * against, so "how many routes are offline" isn't computable — see
   * `kpi.service.ts`. Not a missing-data bug, a genuine unknown. */
  offlineRoutes: number | null;
  /** Share of active routes with 2+ vehicles reporting, in [0, 1]. */
  routeUtilization: number;
  generatedAtMs: number;
}

// ---------------------------------------------------------------------------
// Network Health
// ---------------------------------------------------------------------------

export type NetworkHealthBand = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";

export interface NetworkHealthBreakdown {
  realtimeAvailability: number;
  predictionHealth: number;
  apiLatency: number;
  vehicleFreshness: number;
  congestion: number;
}

export interface NetworkHealth {
  /** 0-100 composite score. */
  score: number;
  band: NetworkHealthBand;
  breakdown: NetworkHealthBreakdown;
  realtimeLatencyMs: number | null;
  vehicleFreshnessMs: number | null;
  generatedAtMs: number;
}

export interface SystemHealthReport {
  network: NetworkHealth;
  predictionEngineOperational: boolean;
  gtfsHealthy: boolean;
  gtfsStationCount: number;
  gtfsRouteCount: number;
  apiLatencyMs: number | null;
  generatedAtMs: number;
}

// ---------------------------------------------------------------------------
// Route Analytics
// ---------------------------------------------------------------------------

export type RouteOperationalHealth = "healthy" | "watch" | "degraded";

export interface RouteAnalytics {
  routeId: string;
  vehicleCount: number;
  averageDelaySeconds: number | null;
  averageEtaSeconds: number | null;
  congestionLevel: CongestionLevel;
  averageSpeedKmh: number | null;
  operationalHealth: RouteOperationalHealth;
}

// ---------------------------------------------------------------------------
// Trends (in-memory rolling history — no database)
// ---------------------------------------------------------------------------

export type TrendMetric =
  | "vehicleCount"
  | "averageDelaySeconds"
  | "averageEtaSeconds"
  | "congestionIndex"
  | "predictionConfidence"
  | "averageSpeedKmh"
  | "realtimeLatencyMs";

export interface TrendPoint {
  timestampMs: number;
  value: number | null;
}

export type TrendSeries = Record<TrendMetric, TrendPoint[]>;

// ---------------------------------------------------------------------------
// AI Insights (rule-based, deterministic — not machine learning)
// ---------------------------------------------------------------------------

export type InsightSeverity = "info" | "warning" | "critical";

export interface AIInsight {
  id: string;
  severity: InsightSeverity;
  category: string;
  message: string;
  generatedAtMs: number;
}
