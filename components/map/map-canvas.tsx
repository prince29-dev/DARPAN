"use client";

import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

import { EmptyState } from "@/components/common/empty-state";
import type { LatLngBounds } from "@/services/map/geo";
import type { NetworkRoute, NetworkStation } from "@/types/network";

const LeafletNetworkMap = dynamic(
  () => import("@/components/map/leaflet-network-map").then((m) => m.LeafletNetworkMap),
  {
    ssr: false,
    loading: () => <MapLoadingState />,
  },
);

function MapLoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface">
      <EmptyState
        icon={MapPin}
        title="Loading map engine…"
        description="Rendering stations and routes from the GTFS Engine."
      />
    </div>
  );
}

export interface MapCanvasProps {
  stations?: NetworkStation[];
  routes?: NetworkRoute[];
  bounds?: LatLngBounds | null;
  hiddenRouteIds?: ReadonlySet<string>;
}

export function MapCanvas({ stations, routes, bounds, hiddenRouteIds }: MapCanvasProps) {
  const hasData = Boolean(stations && routes && stations.length > 0);

  return (
    <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-surface">
      {!hasData && (
        <>
          <svg
            className="absolute inset-0 size-full text-border/60"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-[1px]">
            <EmptyState
              icon={MapPin}
              title="Map engine not connected"
              description="This canvas is ready for a map provider. Stations and routes render here once the GTFS Engine and a map renderer are wired in."
            />
          </div>
        </>
      )}

      {hasData && stations && routes && (
        <LeafletNetworkMap
          stations={stations}
          routes={routes}
          bounds={bounds ?? null}
          hiddenRouteIds={hiddenRouteIds}
        />
      )}
    </div>
  );
}
