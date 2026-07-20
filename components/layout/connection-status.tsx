"use client";

import { useConnectionStatus } from "@/hooks/use-realtime";
import { cn } from "@/lib/utils";
import type { ConnectionState } from "@/types/realtime";

const STATUS_CONFIG: Record<ConnectionState, { dot: string; label: string; pulse: boolean }> = {
  connecting: { dot: "bg-muted-foreground", label: "Connecting…", pulse: true },
  connected: { dot: "bg-accent", label: "Live", pulse: true },
  retrying: { dot: "bg-signal", label: "Retrying…", pulse: true },
  offline: { dot: "bg-destructive", label: "Offline", pulse: false },
  unauthorized: { dot: "bg-destructive", label: "Unauthorized", pulse: false },
  "server-error": { dot: "bg-destructive", label: "Server error", pulse: false },
};

function formatRelativeTime(ms: number | null): string {
  if (ms === null) return "never";
  const seconds = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export interface ConnectionStatusProps {
  /** Shows the last-refresh timestamp alongside the indicator (Top Navigation). */
  showTimestamp?: boolean;
}

/** Real GTFS-Realtime engine connection status — drives the Top Navigation
 * live indicator and the dashboard hero strip. Both consumers share this
 * component rather than duplicating the status→color mapping. */
export function ConnectionStatus({ showTimestamp = false }: ConnectionStatusProps) {
  const { connectionStatus, lastUpdatedMs } = useConnectionStatus();
  const config = STATUS_CONFIG[connectionStatus];

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="relative flex size-1.5">
        {config.pulse && (
          <span
            className={cn("absolute inline-flex size-full animate-signal-pulse rounded-full", config.dot)}
          />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", config.dot)} />
      </span>
      {config.label}
      {showTimestamp && connectionStatus === "connected" && (
        <span className="font-mono tabular-nums text-muted-foreground/70">
          · {formatRelativeTime(lastUpdatedMs)}
        </span>
      )}
    </span>
  );
}
