"use client";

import { Clock, Gauge, Radio, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePredictionAggregate, usePredictionStatus } from "@/hooks/use-prediction";
import { useConnectionStatus } from "@/hooks/use-realtime";
import { cn } from "@/lib/utils";
import { pollNow } from "@/services/realtime/polling-engine";
import { useRealtimeStore } from "@/stores/realtime-store";
import type { ConnectionState } from "@/types/realtime";

const POLL_OPTIONS_MS = [5_000, 15_000, 30_000, 60_000] as const;

const STATUS_BADGE_VARIANT: Record<ConnectionState, "accent" | "signal" | "destructive" | "outline"> = {
  connecting: "outline",
  connected: "accent",
  retrying: "signal",
  offline: "destructive",
  unauthorized: "destructive",
  "server-error": "destructive",
};

const STATUS_LABEL: Record<ConnectionState, string> = {
  connecting: "Connecting",
  connected: "Connected",
  retrying: "Retrying",
  offline: "Offline",
  unauthorized: "Unauthorized",
  "server-error": "Server error",
};

function formatLastUpdate(ms: number | null): string {
  if (ms === null) return "—";
  return new Date(ms).toLocaleTimeString("en-IN", { hour12: false });
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-sm tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function EngineBadge({
  icon: Icon,
  label,
  operational,
}: {
  icon: typeof Clock;
  label: string;
  operational: boolean | null;
}) {
  return (
    <Badge variant={operational === null ? "outline" : operational ? "accent" : "destructive"} className="gap-1.5">
      <Icon className="size-3" strokeWidth={1.75} />
      {label}
    </Badge>
  );
}

export function RealtimeStatusCard() {
  const { connectionStatus, lastUpdatedMs, latencyMs, pollIntervalMs, reconnectAttempts, vehicleCount } =
    useConnectionStatus();
  const setPollIntervalMs = useRealtimeStore((s) => s.setPollIntervalMs);

  // Prediction Engine metrics, layered under the existing Realtime Engine
  // metrics — this card is extended, not replaced. Independent fetches
  // (own hooks, own loading state) so a slow/failed prediction request
  // never blocks the Realtime Engine metrics above from rendering.
  const predictionStatus = usePredictionStatus();
  const predictionAggregate = usePredictionAggregate();
  const predictionOperational = predictionStatus.data ? predictionStatus.data.status === "operational" : null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Radio className="size-4 text-signal" />
            Realtime Engine
          </CardTitle>
          <CardDescription>Live OTD vehicle-position feed (Milestone 6).</CardDescription>
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[connectionStatus]}>{STATUS_LABEL[connectionStatus]}</Badge>
      </CardHeader>

      <div className="grid grid-cols-2 gap-4 border-t border-border px-6 py-4 sm:grid-cols-4">
        <Metric label="Vehicles" value={vehicleCount.toLocaleString("en-IN")} />
        <Metric label="Last update" value={formatLastUpdate(lastUpdatedMs)} />
        <Metric label="Latency" value={latencyMs !== null ? `${latencyMs} ms` : "—"} />
        <Metric label="Reconnects" value={reconnectAttempts.toLocaleString("en-IN")} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3">
        <p className="text-xs text-muted-foreground">Polling interval</p>
        <div className="flex items-center gap-1.5">
          {POLL_OPTIONS_MS.map((ms) => (
            <button
              key={ms}
              type="button"
              onClick={() => setPollIntervalMs(ms)}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-xs transition-colors",
                pollIntervalMs === ms
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:bg-surface-elevated",
              )}
            >
              {ms / 1000}s
            </button>
          ))}
          <button
            type="button"
            onClick={pollNow}
            className="ml-1 rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-elevated"
          >
            Refresh now
          </button>
        </div>
      </div>

      {/* Prediction Engine sub-metrics (Milestone 7 Phase 2 integration). */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <EngineBadge icon={Clock} label="ETA Engine" operational={predictionOperational} />
          <EngineBadge icon={Gauge} label="Congestion Engine" operational={predictionOperational} />
          <EngineBadge icon={TrendingDown} label="Delay Engine" operational={predictionOperational} />
        </div>
        <p className="text-xs text-muted-foreground">
          Prediction confidence{" "}
          <span className="font-mono tabular-nums text-foreground">
            {predictionAggregate.data ? `${Math.round(predictionAggregate.data.averageConfidence * 100)}%` : "—"}
          </span>
        </p>
      </div>
    </Card>
  );
}
