"use client";

import * as React from "react";

import { startPollingEngine } from "@/services/realtime/polling-engine";
import { useRealtimeStore } from "@/stores/realtime-store";
import type { ConnectionState, RealtimeError, RealtimeVehicle } from "@/types/realtime";

/** Ensures the singleton polling engine is running for as long as the
 * calling component is mounted. Ref-counted, so any combination of these
 * hooks mounted across the app keeps exactly one poll loop alive. */
function useEnsurePollingEngine(): void {
  React.useEffect(() => startPollingEngine(), []);
}

export interface UseRealtimeResult {
  vehicles: RealtimeVehicle[];
  connectionStatus: ConnectionState;
  loading: boolean;
  error: RealtimeError | null;
  lastUpdatedMs: number | null;
  latencyMs: number | null;
  pollIntervalMs: number;
  reconnectAttempts: number;
  nextPollAtMs: number | null;
  setPollIntervalMs: (ms: number) => void;
}

/** The full realtime slice — connection lifecycle plus the current vehicle list. */
export function useRealtime(): UseRealtimeResult {
  useEnsurePollingEngine();

  const vehicles = useRealtimeStore((s) => s.vehicles);
  const connectionStatus = useRealtimeStore((s) => s.connectionStatus);
  const loading = useRealtimeStore((s) => s.loading);
  const error = useRealtimeStore((s) => s.error);
  const lastUpdatedMs = useRealtimeStore((s) => s.lastUpdatedMs);
  const latencyMs = useRealtimeStore((s) => s.latencyMs);
  const pollIntervalMs = useRealtimeStore((s) => s.pollIntervalMs);
  const reconnectAttempts = useRealtimeStore((s) => s.reconnectAttempts);
  const nextPollAtMs = useRealtimeStore((s) => s.nextPollAtMs);
  const setPollIntervalMs = useRealtimeStore((s) => s.setPollIntervalMs);

  return {
    vehicles,
    connectionStatus,
    loading,
    error,
    lastUpdatedMs,
    latencyMs,
    pollIntervalMs,
    reconnectAttempts,
    nextPollAtMs,
    setPollIntervalMs,
  };
}

/** Just the live vehicle list. */
export function useVehicles(): RealtimeVehicle[] {
  useEnsurePollingEngine();
  return useRealtimeStore((s) => s.vehicles);
}

/** A single vehicle by its feed entity id (== vehicle id in this feed), or undefined. */
export function useVehicle(entityId: string | null | undefined): RealtimeVehicle | undefined {
  useEnsurePollingEngine();
  return useRealtimeStore((s) => (entityId ? s.vehiclesById.get(entityId) : undefined));
}

export interface UseConnectionStatusResult {
  connectionStatus: ConnectionState;
  lastUpdatedMs: number | null;
  latencyMs: number | null;
  pollIntervalMs: number;
  reconnectAttempts: number;
  nextPollAtMs: number | null;
  vehicleCount: number;
}

/** Connection health, for the dashboard realtime card and top-nav indicator. */
export function useConnectionStatus(): UseConnectionStatusResult {
  useEnsurePollingEngine();

  const connectionStatus = useRealtimeStore((s) => s.connectionStatus);
  const lastUpdatedMs = useRealtimeStore((s) => s.lastUpdatedMs);
  const latencyMs = useRealtimeStore((s) => s.latencyMs);
  const pollIntervalMs = useRealtimeStore((s) => s.pollIntervalMs);
  const reconnectAttempts = useRealtimeStore((s) => s.reconnectAttempts);
  const nextPollAtMs = useRealtimeStore((s) => s.nextPollAtMs);
  const vehicleCount = useRealtimeStore((s) => s.vehicles.length);

  return {
    connectionStatus,
    lastUpdatedMs,
    latencyMs,
    pollIntervalMs,
    reconnectAttempts,
    nextPollAtMs,
    vehicleCount,
  };
}
