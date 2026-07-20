import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Service: Trend
 * ============================================================================
 *
 * Maintains a capped, in-memory ring buffer of KPI snapshots — explicitly
 * no database, per the milestone brief. `record()` is called once per
 * computed overview (from `analytics.service.ts`) and is deduped against
 * a minimum interval so bursts of near-simultaneous requests don't over-
 * sample the same moment in time. History resets on server restart; that
 * is an accepted trade-off of an in-memory store, not a defect.
 */

import type { AnalyticsOverview, TrendMetric, TrendPoint, TrendSeries } from "@/types/analytics";

const MAX_POINTS = 120;
const MIN_RECORD_INTERVAL_MS = 10_000;

interface HistoryEntry {
  timestampMs: number;
  overview: AnalyticsOverview;
  realtimeLatencyMs: number | null;
}

// Module-level state: the ring buffer itself. Persists for the lifetime of
// the server process (or serverless instance) — intentional given "no
// database" and "lightweight in-memory history".
const history: HistoryEntry[] = [];

export interface RecordTrendInput {
  overview: AnalyticsOverview;
  realtimeLatencyMs: number | null;
}

/** Appends one snapshot to history, deduped by `MIN_RECORD_INTERVAL_MS`. */
export function recordTrendSnapshot({ overview, realtimeLatencyMs }: RecordTrendInput): void {
  const now = Date.now();
  const last = history[history.length - 1];

  if (last && now - last.timestampMs < MIN_RECORD_INTERVAL_MS) {
    return;
  }

  history.push({ timestampMs: now, overview, realtimeLatencyMs });

  if (history.length > MAX_POINTS) {
    history.splice(0, history.length - MAX_POINTS);
  }
}

function seriesFor(metric: TrendMetric): TrendPoint[] {
  return history.map((entry) => ({
    timestampMs: entry.timestampMs,
    value:
      metric === "realtimeLatencyMs"
        ? entry.realtimeLatencyMs
        : (entry.overview[metric] as number | null),
  }));
}

const TREND_METRICS: TrendMetric[] = [
  "vehicleCount",
  "averageDelaySeconds",
  "averageEtaSeconds",
  "congestionIndex",
  "predictionConfidence",
  "averageSpeedKmh",
  "realtimeLatencyMs",
];

/** Returns the full rolling history for every tracked metric. */
export function getTrendSeries(): TrendSeries {
  const series = {} as TrendSeries;
  for (const metric of TREND_METRICS) {
    series[metric] = seriesFor(metric);
  }
  return series;
}

/** Test/diagnostic helper — not used by any route, kept for completeness. */
export function getTrendHistoryLength(): number {
  return history.length;
}
