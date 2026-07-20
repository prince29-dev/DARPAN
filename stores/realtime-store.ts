import { create } from "zustand";

import { REALTIME_CONFIG } from "@/config/realtime";
import type { ConnectionState, RealtimeError, RealtimeSnapshot, RealtimeVehicle } from "@/types/realtime";

interface RealtimeState {
  vehicles: RealtimeVehicle[];
  vehiclesById: Map<string, RealtimeVehicle>;
  connectionStatus: ConnectionState;
  loading: boolean;
  error: RealtimeError | null;
  lastUpdatedMs: number | null;
  /** Round-trip latency of the last successful poll (browser → our API → OTD), ms. */
  latencyMs: number | null;
  pollIntervalMs: number;
  reconnectAttempts: number;
  nextPollAtMs: number | null;

  // Debug-panel-only fields (development mode).
  rawEntityCount: number | null;
  responseSizeBytes: number | null;
  upstreamLatencyMs: number | null;

  setLoading: (loading: boolean) => void;
  applySnapshot: (snapshot: RealtimeSnapshot, clientLatencyMs: number) => void;
  applyError: (error: RealtimeError, connectionStatus: ConnectionState) => void;
  setConnectionStatus: (status: ConnectionState) => void;
  setPollIntervalMs: (ms: number) => void;
  setNextPollAtMs: (ms: number | null) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

export function toErrorConnectionState(error: RealtimeError): ConnectionState {
  if (error.kind === "unauthorized" || error.kind === "forbidden") return "unauthorized";
  if (error.kind === "server-error" || error.kind === "invalid-protobuf" || error.kind === "empty-feed") {
    return "server-error";
  }
  return "retrying";
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  vehicles: [],
  vehiclesById: new Map(),
  connectionStatus: "connecting",
  loading: true,
  error: null,
  lastUpdatedMs: null,
  latencyMs: null,
  pollIntervalMs: REALTIME_CONFIG.defaultPollIntervalMs,
  reconnectAttempts: 0,
  nextPollAtMs: null,

  rawEntityCount: null,
  responseSizeBytes: null,
  upstreamLatencyMs: null,

  setLoading: (loading) => set({ loading }),

  applySnapshot: (snapshot, clientLatencyMs) =>
    set({
      vehicles: snapshot.vehicles,
      vehiclesById: new Map(snapshot.vehicles.map((v) => [v.entityId, v])),
      connectionStatus: "connected",
      loading: false,
      error: null,
      lastUpdatedMs: snapshot.fetchedAtMs,
      latencyMs: clientLatencyMs,
      reconnectAttempts: 0,
      rawEntityCount: snapshot.rawEntityCount,
      responseSizeBytes: snapshot.responseSizeBytes,
      upstreamLatencyMs: snapshot.upstreamLatencyMs,
    }),

  applyError: (error, connectionStatus) =>
    set({
      error,
      connectionStatus,
      loading: false,
    }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setNextPollAtMs: (nextPollAtMs) => set({ nextPollAtMs }),

  setPollIntervalMs: (pollIntervalMs) =>
    set({
      pollIntervalMs: Math.min(
        REALTIME_CONFIG.maxPollIntervalMs,
        Math.max(REALTIME_CONFIG.minPollIntervalMs, pollIntervalMs),
      ),
    }),

  incrementReconnectAttempts: () => set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));
