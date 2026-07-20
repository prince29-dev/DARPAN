/**
 * Analytics API client (Milestone 8). Mirrors `lib/prediction-api.ts`'s
 * pattern exactly — centralizes every fetch to /api/analytics/* so no
 * component calls `fetch()` directly.
 */

import type {
  AIInsight,
  AnalyticsOverview,
  NetworkHealth,
  RouteAnalytics,
  SystemHealthReport,
  TrendSeries,
} from "@/types/analytics";

const REQUEST_TIMEOUT_MS = 8_000;

export interface AnalyticsApiError {
  message: string;
  status: number | null;
}

export type AnalyticsApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AnalyticsApiError };

async function requestJson<T>(path: string): Promise<AnalyticsApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const body: unknown = await response.json();

    if (!response.ok) {
      const message =
        body && typeof body === "object" && "error" in body
          ? String((body as { error: { message?: string } }).error?.message ?? "Request failed.")
          : `Request failed with status ${response.status}.`;
      return { ok: false, error: { message, status: response.status } };
    }

    return { ok: true, data: body as T };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: { message: "Analytics request timed out.", status: null } };
    }
    const message = error instanceof Error ? error.message : "Unknown network error.";
    return { ok: false, error: { message, status: null } };
  } finally {
    clearTimeout(timer);
  }
}

/** GET /api/analytics/overview */
export function fetchAnalyticsOverview(): Promise<AnalyticsApiResult<AnalyticsOverview>> {
  return requestJson<AnalyticsOverview>("/api/analytics/overview");
}

/** GET /api/analytics/network */
export function fetchNetworkHealth(): Promise<AnalyticsApiResult<NetworkHealth>> {
  return requestJson<NetworkHealth>("/api/analytics/network");
}

/** GET /api/analytics/routes */
export async function fetchRouteAnalytics(): Promise<AnalyticsApiResult<RouteAnalytics[]>> {
  const result = await requestJson<{ count: number; results: RouteAnalytics[] }>("/api/analytics/routes");
  return result.ok ? { ok: true, data: result.data.results } : result;
}

/** GET /api/analytics/trends */
export function fetchTrends(): Promise<AnalyticsApiResult<TrendSeries>> {
  return requestJson<TrendSeries>("/api/analytics/trends");
}

/** GET /api/analytics/insights */
export async function fetchInsights(): Promise<AnalyticsApiResult<AIInsight[]>> {
  const result = await requestJson<{ count: number; results: AIInsight[] }>("/api/analytics/insights");
  return result.ok ? { ok: true, data: result.data.results } : result;
}

/** GET /api/analytics/health */
export function fetchSystemHealth(): Promise<AnalyticsApiResult<SystemHealthReport>> {
  return requestJson<SystemHealthReport>("/api/analytics/health");
}
