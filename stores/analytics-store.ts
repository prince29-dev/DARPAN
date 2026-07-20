import { create } from "zustand";

import type { AnalyticsApiResult } from "@/lib/analytics-api";
import type {
  AIInsight,
  AnalyticsOverview,
  NetworkHealth,
  RouteAnalytics,
  SystemHealthReport,
  TrendSeries,
} from "@/types/analytics";

/**
 * Milestone 8 fix: before this store existed, every Analytics component
 * (`NetworkHealthCard`, `NetworkAnalyticsPanel`, `network-health-badge`,
 * `KPIGrid`, `PredictionAnalyticsSummary`, etc.) called its own
 * independent hook instance, each with its own fetch-on-mount and its
 * own 20s `setInterval` — so a single page could trigger 2-3x redundant
 * requests to the same endpoint, uncoordinated, on top of an
 * expensive-at-the-time backend computation. This store is the single
 * source of truth: one polling engine (`services/analytics/polling-engine.ts`)
 * writes to it, and every `hooks/use-analytics.ts` hook just reads a
 * slice — "all dashboard widgets consume the same analytics snapshot."
 */

export interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdatedMs: number | null;
}

function initialResource<T>(): ResourceState<T> {
  return { data: null, loading: true, error: null, lastUpdatedMs: null };
}

function applyResult<T>(result: AnalyticsApiResult<T>, previous: ResourceState<T>): ResourceState<T> {
  if (result.ok) {
    return { data: result.data, loading: false, error: null, lastUpdatedMs: Date.now() };
  }
  // Keep the last known-good data visible alongside the error, same as
  // the Realtime Engine store does — a transient failure shouldn't blank
  // out a working dashboard.
  return { ...previous, loading: false, error: result.error.message };
}

interface AnalyticsStoreState {
  overview: ResourceState<AnalyticsOverview>;
  networkHealth: ResourceState<NetworkHealth>;
  routes: ResourceState<RouteAnalytics[]>;
  trends: ResourceState<TrendSeries>;
  insights: ResourceState<AIInsight[]>;
  systemHealth: ResourceState<SystemHealthReport>;

  reconnectAttempts: number;

  setOverview: (result: AnalyticsApiResult<AnalyticsOverview>) => void;
  setNetworkHealth: (result: AnalyticsApiResult<NetworkHealth>) => void;
  setRoutes: (result: AnalyticsApiResult<RouteAnalytics[]>) => void;
  setTrends: (result: AnalyticsApiResult<TrendSeries>) => void;
  setInsights: (result: AnalyticsApiResult<AIInsight[]>) => void;
  setSystemHealth: (result: AnalyticsApiResult<SystemHealthReport>) => void;

  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

export const useAnalyticsStore = create<AnalyticsStoreState>((set, get) => ({
  overview: initialResource(),
  networkHealth: initialResource(),
  routes: initialResource(),
  trends: initialResource(),
  insights: initialResource(),
  systemHealth: initialResource(),

  reconnectAttempts: 0,

  setOverview: (result) => set({ overview: applyResult(result, get().overview) }),
  setNetworkHealth: (result) => set({ networkHealth: applyResult(result, get().networkHealth) }),
  setRoutes: (result) => set({ routes: applyResult(result, get().routes) }),
  setTrends: (result) => set({ trends: applyResult(result, get().trends) }),
  setInsights: (result) => set({ insights: applyResult(result, get().insights) }),
  setSystemHealth: (result) => set({ systemHealth: applyResult(result, get().systemHealth) }),

  incrementReconnectAttempts: () => set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));
