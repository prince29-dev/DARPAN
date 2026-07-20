import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Service: AnalyticsEngine (composition root)
 * ============================================================================
 *
 * Mirrors Milestone 7's `PredictionEngine` composition pattern: one shared
 * context (`buildContext()`) is assembled from the existing, untouched
 * Realtime Engine (`getVehiclePositionsSnapshot`) and Prediction Engine
 * (`getCachedPredictionBatch`), then handed to each single-responsibility
 * analytics service. No analytics endpoint re-fetches or re-predicts —
 * every number traces back to those two existing engines.
 *
 * ----------------------------------------------------------------------
 * Milestone 8 performance fix
 * ----------------------------------------------------------------------
 * The original version called `buildContext()` fresh on every route
 * invocation, and `buildContext()` called `getPredictionEngine()
 * .predictBatch()` fresh every time too — an O(n²) computation
 * (~2.8s for the real 5,356-vehicle feed; see
 * `congestion.service.ts`'s module doc for why). With 6 analytics routes
 * and several dashboard widgets each polling independently, concurrent
 * requests piled up on Node's single JS thread, so the *last* request in
 * a burst could take 20+ seconds — exactly the reported symptom.
 *
 * The fix has three layers, each closing off one source of duplicate
 * work:
 *  1. `congestion.service.ts`'s `assessBatch()` makes a single full-fleet
 *     prediction batch O(n) instead of O(n²).
 *  2. `prediction.service.ts`'s `getCachedPredictionBatch()` caches that
 *     batch keyed to the Realtime Engine's own data freshness
 *     (`snapshot.fetchedAtMs`), so it only actually runs once per real
 *     data refresh — shared by every `/api/prediction/*` route AND this
 *     file — not once per HTTP request.
 *  3. `buildContext()` below adds its own cache + in-flight coalescing
 *     over the *rest* of the context (overview, network health, route
 *     analytics), keyed the same way, so a burst of concurrent
 *     `/api/analytics/*` requests — from the many independent dashboard
 *     widgets — shares one computation instead of six.
 *
 * Together: "Realtime GTFS fetched once, Prediction Engine executes
 * once" per real data refresh, regardless of how many requests arrive.
 */

import { computeOverview } from "@/services/analytics/kpi.service";
import { computeNetworkHealth } from "@/services/analytics/network-health.service";
import { computeRouteAnalytics } from "@/services/analytics/route-analytics.service";
import { generateInsights } from "@/services/analytics/insight.service";
import { getTrendSeries, recordTrendSnapshot } from "@/services/analytics/trend.service";
import { getGtfsStatistics } from "@/services/gtfs/statistics";
import { getCachedPredictionBatch } from "@/services/prediction/prediction.service";
import { getVehiclePositionsSnapshot } from "@/services/realtime/realtime.service";
import { recordSnapshot as recordDatasetSnapshot } from "@/ml/exporter/dataset-export.service";
import type {
  AIInsight,
  AnalyticsOverview,
  NetworkHealth,
  RouteAnalytics,
  SystemHealthReport,
  TrendSeries,
} from "@/types/analytics";
import type { VehiclePrediction } from "@/types/prediction";
import type { RealtimeSnapshot } from "@/types/realtime";

interface AnalyticsContext {
  snapshot: RealtimeSnapshot;
  predictions: VehiclePrediction[];
  overview: AnalyticsOverview;
  networkHealth: NetworkHealth;
  routes: RouteAnalytics[];
  predictionEngineOperational: boolean;
}

let cachedContext: { fetchedAtMs: number; context: AnalyticsContext } | null = null;
let inFlightContext: Promise<AnalyticsContext> | null = null;

async function computeContext(snapshot: RealtimeSnapshot): Promise<AnalyticsContext> {
  // Single prediction execution for this data refresh — shared with
  // every /api/prediction/* route via the same cache key.
  const predictions = getCachedPredictionBatch(snapshot);
  const overview = computeOverview(predictions);

  // Matches the same "operational" definition /api/prediction/status uses:
  // the Prediction Engine's only real dependency is the Realtime Engine,
  // so successfully reaching this point means it's operational.
  const predictionEngineOperational = true;

  const networkHealth = computeNetworkHealth({ snapshot, overview, predictionEngineOperational });
  const routes = computeRouteAnalytics(predictions);

  recordTrendSnapshot({ overview, realtimeLatencyMs: snapshot.upstreamLatencyMs });

  // Milestone 9.1: append one ML training row per vehicle to dataset.csv.
  // Reuses the exact `snapshot.vehicles` and `predictions` already
  // computed above — no separate fetch, no separate prediction run.
  // Internally throttled to a real 15s cadence and deduplicated; see
  // ml/exporter/dataset-export.service.ts.
  recordDatasetSnapshot(snapshot.vehicles, predictions, snapshot.fetchedAtMs);

  return { snapshot, predictions, overview, networkHealth, routes, predictionEngineOperational };
}

/**
 * Returns the shared AnalyticsContext — realtime vehicles, prediction
 * results, and every derived network metric — computed at most once per
 * Realtime Engine refresh. Concurrent callers within the same refresh
 * window (any burst of `/api/analytics/*` requests) coalesce onto the
 * same in-flight computation or the same warm cache; nobody triggers a
 * second one.
 */
async function buildContext(): Promise<AnalyticsContext> {
  const snapshot = await getVehiclePositionsSnapshot();

  if (cachedContext && cachedContext.fetchedAtMs === snapshot.fetchedAtMs) {
    return cachedContext.context;
  }

  if (inFlightContext) {
    return inFlightContext;
  }

  inFlightContext = computeContext(snapshot)
    .then((context) => {
      cachedContext = { fetchedAtMs: snapshot.fetchedAtMs, context };
      return context;
    })
    .finally(() => {
      inFlightContext = null;
    });

  return inFlightContext;
}

/** GET /api/analytics/overview */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { overview } = await buildContext();
  return overview;
}

/** GET /api/analytics/network */
export async function getNetworkHealthReport(): Promise<NetworkHealth> {
  const { networkHealth } = await buildContext();
  return networkHealth;
}

/** GET /api/analytics/routes */
export async function getRouteAnalyticsList(): Promise<RouteAnalytics[]> {
  const { routes } = await buildContext();
  return routes;
}

/** GET /api/analytics/trends */
export async function getTrends(): Promise<TrendSeries> {
  await buildContext(); // ensures this moment is recorded before reading history back
  return getTrendSeries();
}

/** GET /api/analytics/insights */
export async function getInsights(): Promise<AIInsight[]> {
  const { snapshot, predictions, overview, networkHealth, routes } = await buildContext();
  return generateInsights({ overview, networkHealth, routes, predictions, vehicles: snapshot.vehicles });
}

/** GET /api/analytics/health */
export async function getSystemHealthReport(): Promise<SystemHealthReport> {
  const { snapshot, networkHealth, predictionEngineOperational } = await buildContext();
  const gtfsStats = getGtfsStatistics();

  return {
    network: networkHealth,
    predictionEngineOperational,
    gtfsHealthy: gtfsStats.stationCount > 0 && gtfsStats.routeCount > 0,
    gtfsStationCount: gtfsStats.stationCount,
    gtfsRouteCount: gtfsStats.routeCount,
    apiLatencyMs: snapshot.upstreamLatencyMs,
    generatedAtMs: Date.now(),
  };
}
