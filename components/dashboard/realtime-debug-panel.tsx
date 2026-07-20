"use client";

import * as React from "react";
import { Bug } from "lucide-react";

import { useConnectionStatus } from "@/hooks/use-realtime";
import { useRealtimeStore } from "@/stores/realtime-store";

function useNowTicking(intervalMs = 500): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

/**
 * Renders only when `NODE_ENV === "development"` — never shipped to a
 * production build's user-visible output.
 */
export function RealtimeDebugPanel() {
  const { connectionStatus, latencyMs, reconnectAttempts, vehicleCount, nextPollAtMs } =
    useConnectionStatus();
  const rawEntityCount = useRealtimeStore((s) => s.rawEntityCount);
  const responseSizeBytes = useRealtimeStore((s) => s.responseSizeBytes);
  const upstreamLatencyMs = useRealtimeStore((s) => s.upstreamLatencyMs);
  const now = useNowTicking();

  if (process.env.NODE_ENV !== "development") return null;

  const countdownSeconds = nextPollAtMs ? Math.max(0, Math.ceil((nextPollAtMs - now) / 1000)) : null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-64 rounded-md border border-border bg-surface-elevated/95 p-3 text-xs shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
        <Bug className="size-3.5 text-signal" />
        Realtime Debug
      </div>
      <Row label="Connection" value={connectionStatus} />
      <Row label="Raw entities" value={rawEntityCount?.toLocaleString("en-IN") ?? "—"} />
      <Row label="Decoded vehicles" value={vehicleCount.toLocaleString("en-IN")} />
      <Row
        label="Response size"
        value={responseSizeBytes !== null ? `${(responseSizeBytes / 1024).toFixed(1)} KB` : "—"}
      />
      <Row label="Client latency" value={latencyMs !== null ? `${latencyMs} ms` : "—"} />
      <Row label="Upstream latency" value={upstreamLatencyMs !== null ? `${upstreamLatencyMs} ms` : "—"} />
      <Row label="Next poll" value={countdownSeconds !== null ? `${countdownSeconds}s` : "—"} />
      <Row label="Reconnect attempts" value={reconnectAttempts} />
    </div>
  );
}
