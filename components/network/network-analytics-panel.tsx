"use client";

import { useNetworkData } from "@/components/network/network-data-context";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function NetworkAnalyticsPanel() {
  const { analytics } = useNetworkData();

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
        Network Statistics
      </p>
      <Row label="Total stations" value={analytics.totalStations.toLocaleString("en-IN")} />
      <Row label="Total routes" value={analytics.totalRoutes.toLocaleString("en-IN")} />
      <Row label="Total shapes" value={analytics.totalShapes.toLocaleString("en-IN")} />
      <Row label="Total trips" value={analytics.totalTrips.toLocaleString("en-IN")} />
      <Row label="Interchanges" value={analytics.totalInterchanges.toLocaleString("en-IN")} />
      <Row label="Avg stops / trip" value={analytics.averageStopsPerTrip.toFixed(1)} />
      <Row
        label="Largest route"
        value={analytics.largestRoute ? `${analytics.largestRoute.value} stops` : "—"}
      />
      <Row
        label="Smallest route"
        value={analytics.smallestRoute ? `${analytics.smallestRoute.value} stops` : "—"}
      />
      <Row
        label="Longest shape"
        value={analytics.longestShape ? `${analytics.longestShape.value.toFixed(1)} km` : "—"}
      />
      <Row
        label="Shortest shape"
        value={analytics.shortestShape ? `${analytics.shortestShape.value.toFixed(1)} km` : "—"}
      />
    </div>
  );
}
