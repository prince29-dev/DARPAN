"use client";

import { REALTIME_CONFIG } from "@/config/realtime";
import { fetchVehiclePositions } from "@/services/realtime/vehicle-feed-client";
import { toErrorConnectionState, useRealtimeStore } from "@/stores/realtime-store";

let subscriberCount = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlightController: AbortController | null = null;
let consecutiveFailures = 0;
let visibilityListenerAttached = false;
let started = false;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function backoffDelayMs(): number {
  const { backoffBaseMs, backoffFactor, backoffMaxMs } = REALTIME_CONFIG;
  const delay = backoffBaseMs * backoffFactor ** Math.min(consecutiveFailures, 10);
  return Math.min(delay, backoffMaxMs);
}

async function pollOnce() {
  const store = useRealtimeStore.getState();
  store.setConnectionStatus(consecutiveFailures > 0 ? "retrying" : store.connectionStatus);

  inFlightController = new AbortController();
  const result = await fetchVehiclePositions(inFlightController.signal);
  inFlightController = null;

  if (result.ok) {
    consecutiveFailures = 0;
    useRealtimeStore.getState().applySnapshot(result.snapshot, result.clientLatencyMs);
    scheduleNext(useRealtimeStore.getState().pollIntervalMs);
    return;
  }

  consecutiveFailures += 1;
  useRealtimeStore.getState().incrementReconnectAttempts();
  useRealtimeStore.getState().applyError(result.error, toErrorConnectionState(result.error));

  // Auth/permission errors won't resolve by retrying rapidly, but we still
  // keep a slow heartbeat in case the key is fixed without a page reload.
  const isTerminal = result.error.kind === "unauthorized" || result.error.kind === "forbidden";
  const delay = isTerminal ? REALTIME_CONFIG.backoffMaxMs : backoffDelayMs();
  scheduleNext(delay);
}

function scheduleNext(delayMs: number) {
  clearTimer();
  useRealtimeStore.getState().setNextPollAtMs(Date.now() + delayMs);
  timer = setTimeout(() => {
    void pollOnce();
  }, delayMs);
}

function handleVisibilityChange() {
  if (document.hidden) {
    clearTimer();
    inFlightController?.abort();
  } else if (started) {
    // Resume immediately, then fall back to the normal cadence.
    void pollOnce();
  }
}

/** Starts the polling loop on first subscriber; ref-counted so multiple
 * components (`useRealtime`, debug panel, etc.) can safely mount/unmount
 * independently without starting duplicate loops. */
export function startPollingEngine(): () => void {
  subscriberCount += 1;

  if (!started) {
    started = true;
    consecutiveFailures = 0;
    void pollOnce();

    if (typeof document !== "undefined" && !visibilityListenerAttached) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      visibilityListenerAttached = true;
    }
  }

  return function stopPollingEngine() {
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0) {
      started = false;
      clearTimer();
      inFlightController?.abort();
      useRealtimeStore.getState().setNextPollAtMs(null);
      if (visibilityListenerAttached) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        visibilityListenerAttached = false;
      }
    }
  };
}

/** Forces an immediate poll outside the normal schedule (e.g. after the
 * user changes the poll interval, or a manual "refresh now" action). */
export function pollNow(): void {
  clearTimer();
  void pollOnce();
}
