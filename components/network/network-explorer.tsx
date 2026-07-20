"use client";

import * as React from "react";

import { LayerControl } from "@/components/map/layer-control";
import { MapCanvas } from "@/components/map/map-canvas";
import { MapProvider } from "@/components/map/map-context";
import { MapLegend } from "@/components/map/map-legend";
import { MapStatus } from "@/components/map/map-status";
import { MapToolbar } from "@/components/map/map-toolbar";
import { NetworkHealthBadge } from "@/components/map/network-health-badge";
import { ZoomControl } from "@/components/map/zoom-control";
import { NetworkAnalyticsPanel } from "@/components/network/network-analytics-panel";
import { NetworkDataProvider } from "@/components/network/network-data-context";
import { NetworkInfoPanel } from "@/components/network/network-info-panel";
import { NetworkLineFilter } from "@/components/network/network-line-filter";
import { NetworkPredictionPanel } from "@/components/network/network-prediction-panel";
import { NetworkSearchPanel } from "@/components/network/network-search-panel";
import { Card } from "@/components/ui/card";
import type { LatLngBounds } from "@/services/map/geo";
import type { NetworkAnalytics, NetworkRoute, NetworkStation } from "@/types/network";
import type { Trip } from "@/types/trip";

export interface NetworkExplorerProps {
  stations: NetworkStation[];
  routes: NetworkRoute[];
  analytics: NetworkAnalytics;
  bounds: LatLngBounds | null;
  trips: Trip[];
}

export function NetworkExplorer({ stations, routes, analytics, bounds, trips }: NetworkExplorerProps) {
  const [layersOpen, setLayersOpen] = React.useState(false);
  const [hiddenRouteIds, setHiddenRouteIds] = React.useState<Set<string>>(() => new Set());

  const toggleRoute = React.useCallback((routeId: string) => {
    setHiddenRouteIds((prev) => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  }, []);

  const resetRoutes = React.useCallback(() => setHiddenRouteIds(new Set()), []);

  return (
    <MapProvider>
      <NetworkDataProvider stations={stations} routes={routes} analytics={analytics}>
        <div className="flex h-full flex-col gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">Network</h1>
              <p className="text-sm text-muted-foreground">
                The digital twin map of the metro network — {stations.length.toLocaleString("en-IN")}{" "}
                real stations, {routes.length.toLocaleString("en-IN")} routes, live from the GTFS
                Engine.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NetworkHealthBadge />
              <MapStatus />
            </div>
          </div>

          <div className="grid min-h-[640px] flex-1 grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_340px]">
            <Card className="scrollbar-thin flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-4 lg:max-h-none">
              <NetworkSearchPanel trips={trips} />
              <div className="h-px bg-border" />
              <NetworkLineFilter
                hiddenRouteIds={hiddenRouteIds}
                onToggle={toggleRoute}
                onReset={resetRoutes}
              />
              <div className="h-px bg-border" />
              <NetworkAnalyticsPanel />
              <div className="h-px bg-border" />
              <NetworkPredictionPanel />
            </Card>

            <div className="relative flex min-h-[480px] flex-1">
              <MapCanvas
                stations={stations}
                routes={routes}
                bounds={bounds}
                hiddenRouteIds={hiddenRouteIds}
              />

              <div className="absolute left-4 top-4 flex items-start gap-3">
                <MapToolbar
                  layersOpen={layersOpen}
                  onToggleLayers={() => setLayersOpen((v) => !v)}
                />
                {layersOpen && <LayerControl />}
              </div>

              <div className="absolute bottom-4 right-4">
                <ZoomControl />
              </div>

              <div className="absolute bottom-4 left-4 hidden sm:block">
                <MapLegend />
              </div>
            </div>

            <NetworkInfoPanel />
          </div>
        </div>
      </NetworkDataProvider>
    </MapProvider>
  );
}
