"use client";

/**
 * Reusable hooks over the Analytics Engine. Milestone 8 fix: these no
 * longer each independently fetch and poll — every hook here ensures the
 * single shared `startAnalyticsPollingEngine()` loop is running (ref-
 * counted, so any number of mounted components share exactly one poll
 * cycle) and reads its slice of `stores/analytics-store.ts` via a
 * selector. `retry()` triggers one shared out-of-cycle poll rather than
 * a one-off duplicate request.
 *
 * Public shape (`{ data, loading, error, retry }`) is unchanged from the
 * original per-hook-fetch implementation, so no component that consumes
 * these hooks needed to change — see the Milestone 8 refactor notes.
 */

import * as React from "react";

import { pollAnalyticsNow, startAnalyticsPollingEngine } from "@/services/analytics/polling-engine";
import { useAnalyticsStore } from "@/stores/analytics-store";
import type {
  AIInsight,
  AnalyticsOverview,
  NetworkHealth,
  RouteAnalytics,
  SystemHealthReport,
  TrendSeries,
} from "@/types/analytics";

export interface UseAnalyticsResourceResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/** Ensures the singleton analytics polling engine is running for as long
 * as the calling component is mounted. */
function useEnsureAnalyticsPollingEngine(): void {
  React.useEffect(() => startAnalyticsPollingEngine(), []);
}

/** GET /api/analytics/overview */
export function useAnalyticsOverview(): UseAnalyticsResourceResult<AnalyticsOverview> {
  useEnsureAnalyticsPollingEngine();
  const resource = useAnalyticsStore((s) => s.overview);
  return { ...resource, retry: pollAnalyticsNow };
}

/** GET /api/analytics/network */
export function useNetworkHealth(): UseAnalyticsResourceResult<NetworkHealth> {
  useEnsureAnalyticsPollingEngine();
  const resource = useAnalyticsStore((s) => s.networkHealth);
  return { ...resource, retry: pollAnalyticsNow };
}

/** GET /api/analytics/routes */
export function useRouteAnalytics(): UseAnalyticsResourceResult<RouteAnalytics[]> {
  useEnsureAnalyticsPollingEngine();
  const resource = useAnalyticsStore((s) => s.routes);
  return { ...resource, retry: pollAnalyticsNow };
}

/** GET /api/analytics/trends */
export function useTrends(): UseAnalyticsResourceResult<TrendSeries> {
  useEnsureAnalyticsPollingEngine();
  const resource = useAnalyticsStore((s) => s.trends);
  return { ...resource, retry: pollAnalyticsNow };
}

/** GET /api/analytics/insights */
export function useInsights(): UseAnalyticsResourceResult<AIInsight[]> {
  useEnsureAnalyticsPollingEngine();
  const resource = useAnalyticsStore((s) => s.insights);
  return { ...resource, retry: pollAnalyticsNow };
}

/** GET /api/analytics/health */
export function useSystemHealth(): UseAnalyticsResourceResult<SystemHealthReport> {
  useEnsureAnalyticsPollingEngine();
  const resource = useAnalyticsStore((s) => s.systemHealth);
  return { ...resource, retry: pollAnalyticsNow };
}
