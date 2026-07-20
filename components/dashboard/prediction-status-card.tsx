"use client";

import { BrainCircuit } from "lucide-react";

import {
  PredictionErrorState,
  PredictionSkeleton,
} from "@/components/dashboard/prediction-loading-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePredictionStatus } from "@/hooks/use-prediction";
import { cn } from "@/lib/utils";

function formatTimestamp(ms: number | null): string {
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

export interface PredictionStatusCardProps {
  /** "detailed" shows all fields (Overview, AI Lab); "compact" is a
   * smaller read-only summary (Settings). */
  variant?: "detailed" | "compact";
  className?: string;
}

/**
 * Live status of the Prediction Engine (`GET /api/prediction/status`).
 * Shows "Connected" once the engine reports `status: "operational"`,
 * otherwise "Offline" — mirroring the Realtime Engine card's badge
 * pattern for visual consistency.
 */
export function PredictionStatusCard({ variant = "detailed", className }: PredictionStatusCardProps) {
  const { data, loading, error, retry } = usePredictionStatus();

  const connected = data?.status === "operational";
  const badgeVariant = loading ? "outline" : connected ? "accent" : "destructive";
  const badgeLabel = loading ? "Connecting" : connected ? "Connected" : "Offline";

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="size-4 text-accent" strokeWidth={1.75} />
            Prediction Engine
          </CardTitle>
          <CardDescription>
            {variant === "detailed"
              ? "Milestone 7 · deterministic ETA, delay, and congestion architecture."
              : "Read-only status."}
          </CardDescription>
        </div>
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      </CardHeader>

      {loading && <PredictionSkeleton lines={variant === "detailed" ? 4 : 2} className="px-6 pb-4" />}

      {!loading && error && <PredictionErrorState message={error} onRetry={retry} className="px-6 pb-4" />}

      {!loading && !error && data && (
        <div
          className={cn(
            "grid gap-4 border-t border-border px-6 py-4",
            variant === "detailed" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2",
          )}
        >
          <Metric label="Method / Version" value={data.methodology} />
          <Metric label="Available vehicles" value={data.availableVehicles.toLocaleString("en-IN")} />
          {variant === "detailed" && (
            <>
              <Metric label="Last prediction update" value={formatTimestamp(data.lastRealtimeUpdateMs)} />
              <Metric label="Prediction health" value={data.status} />
            </>
          )}
        </div>
      )}
    </Card>
  );
}
