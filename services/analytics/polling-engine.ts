"use client";

/**
 * Client-side singleton polling engine for the Analytics Engine — mirrors
 * `services/realtime/polling-engine.ts`'s proven ref-counted pattern.
 *
 * One poll cycle fetches all six `/api/analytics/*` endpoints via
 * `Promise.allSettled` (independent — one slow/failed endpoint never
 * blocks the others) and writes each result straight into
 * `stores/analytics-store.ts`. No matter how many components mount
 * `useAnalyticsOverview()`/`useNetworkHealth()`/etc., there is exactly
 * one interval driving exactly one request per endpoint per cycle.
 */

import {
  fetchAnalyticsOverview,
  fetchInsights,
  fetchNetworkHealth,
  fetchRouteAnalytics,
  fetchSystemHealth,
  fetchTrends,
  type AnalyticsApiResult,
} from "@/lib/analytics-api";
import { useAnalyticsStore } from "@/stores/analytics-store";

const POLL_INTERVAL_MS = 20_000;
const BACKOFF_BASE_MS = 3_000;
const BACKOFF_FACTOR = 2;
const BACKOFF_MAX_MS = 60_000;

let subscriberCount = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let consecutiveFullFailures = 0;
let visibilityListenerAttached = false;
let started = false;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function backoffDelayMs(): number {
  const delay = BACKOFF_BASE_MS * BACKOFF_FACTOR ** Math.min(consecutiveFullFailures, 6);
  return Math.min(delay, BACKOFF_MAX_MS);
}

function normalize<T>(settled: PromiseSettledResult<AnalyticsApiResult<T>>): AnalyticsApiResult<T> {
  if (settled.status === "fulfilled") return settled.value;
  return { ok: false, error: { message: "Request failed unexpectedly.", status: null } };
}

async function pollOnce() {
  const store = useAnalyticsStore.getState();

  const [overview, networkHealth, routes, trends, insights, systemHealth] = await Promise.allSettled([
    fetchAnalyticsOverview(),
    fetchNetworkHealth(),
    fetchRouteAnalytics(),
    fetchTrends(),
    fetchInsights(),
    fetchSystemHealth(),
  ]);

  store.setOverview(normalize(overview));
  store.setNetworkHealth(normalize(networkHealth));
  store.setRoutes(normalize(routes));
  store.setTrends(normalize(trends));
  store.setInsights(normalize(insights));
  store.setSystemHealth(normalize(systemHealth));

  const allFailed = [overview, networkHealth, routes, trends, insights, systemHealth].every(
    (settled) => settled.status === "rejected" || !settled.value.ok,
  );

  if (allFailed) {
    consecutiveFullFailures += 1;
    useAnalyticsStore.getState().incrementReconnectAttempts();
    scheduleNext(backoffDelayMs());
  } else {
    consecutiveFullFailures = 0;
    useAnalyticsStore.getState().resetReconnectAttempts();
    scheduleNext(POLL_INTERVAL_MS);
  }
}

function scheduleNext(delayMs: number) {
  clearTimer();
  timer = setTimeout(() => void pollOnce(), delayMs);
}

function handleVisibilityChange() {
  if (document.hidden) {
    clearTimer();
  } else if (started) {
    void pollOnce();
  }
}

/** Starts the polling loop on first subscriber; ref-counted so multiple
 * components can mount/unmount independently without starting duplicate
 * loops — the fix for "duplicate polling" / "retry loop" symptoms. */
export function startAnalyticsPollingEngine(): () => void {
  subscriberCount += 1;

  if (!started) {
    started = true;
    consecutiveFullFailures = 0;
    void pollOnce();

    if (typeof document !== "undefined" && !visibilityListenerAttached) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      visibilityListenerAttached = true;
    }
  }

  return function stopAnalyticsPollingEngine() {
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0) {
      started = false;
      clearTimer();
      if (visibilityListenerAttached) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        visibilityListenerAttached = false;
      }
    }
  };
}

/** Forces an immediate poll outside the normal schedule — used by every
 * hook's `retry()` so retrying one widget refreshes the whole shared
 * snapshot rather than issuing a one-off duplicate request. */
export function pollAnalyticsNow(): void {
  clearTimer();
  void pollOnce();
}
