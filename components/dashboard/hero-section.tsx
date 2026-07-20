"use client";

import { ConnectionStatus } from "@/components/layout/connection-status";
import { Badge } from "@/components/ui/badge";
import { useConnectionStatus } from "@/hooks/use-realtime";

const REALTIME_STATUS_COPY: Record<string, string> = {
  connected: "Realtime engine live",
  connecting: "Realtime engine connecting",
  retrying: "Realtime engine retrying",
  offline: "Realtime engine offline",
  unauthorized: "Realtime engine needs an OTD_API_KEY",
  "server-error": "Realtime engine reporting a server error",
};

export function HeroSection() {
  const { connectionStatus } = useConnectionStatus();
  const realtimeCopy = REALTIME_STATUS_COPY[connectionStatus] ?? "Realtime engine status unknown";

  return (
    <div className="flex flex-col gap-4 border-b border-border px-6 py-10 sm:px-8 sm:py-14">
      <Badge variant="accent" className="w-fit">
        Digital Twin Platform
      </Badge>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          DARPAN
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Digital AI Representation of Public Transit Analytics Network — an open-source
          digital twin platform for Delhi Metro, built to extend across buses, rail, and
          full urban mobility.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <ConnectionStatus />
        <span className="h-3.5 w-px bg-border" />
        <span className="text-xs text-muted-foreground">
          GTFS Engine connected — {realtimeCopy} — Simulation and AI engines not yet connected
        </span>
      </div>
    </div>
  );
}
