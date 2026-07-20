"use client";

import { MousePointerClick } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/common/empty-state";
import { useMapContext } from "@/components/map/map-context";
import { useNetworkData } from "@/components/network/network-data-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { haversineKm } from "@/services/map/geo";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-foreground">{children}</dd>
    </div>
  );
}

function StationDetail({ stationId }: { stationId: string }) {
  const { stationById, routeById } = useNetworkData();
  const { selectStation, flyTo } = useMapContext();
  const station = stationById.get(stationId);

  if (!station) return null;

  const nearby = station.nearbyStationIds
    .map((id) => stationById.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ station: s, distanceKm: haversineKm(station, s) }));

  return (
    <CardContent className="flex flex-col gap-4">
      <div>
        <p className="font-display text-lg font-semibold">{station.name}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {station.isInterchange && <Badge variant="accent">Interchange</Badge>}
          {station.isTerminal && <Badge variant="signal">Terminal</Badge>}
          {!station.isInterchange && !station.isTerminal && (
            <Badge variant="outline">Station</Badge>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Field label="Latitude">{station.lat.toFixed(6)}</Field>
        <Field label="Longitude">{station.lon.toFixed(6)}</Field>
        <Field label="Stop ID">{station.id}</Field>
        <Field label="Trips using station">{station.tripCount.toLocaleString("en-IN")}</Field>
      </dl>

      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">
          Connected routes ({station.routeIds.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {station.routeIds.map((routeId) => {
            const route = routeById.get(routeId);
            if (!route) return null;
            return (
              <Badge key={routeId} variant="outline" className="gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: route.color }}
                  aria-hidden="true"
                />
                {route.longName}
              </Badge>
            );
          })}
        </div>
      </div>

      {nearby.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">Nearby stations</p>
          <div className="flex flex-col gap-1">
            {nearby.map(({ station: n, distanceKm }) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  selectStation(n.id);
                  flyTo(n.lat, n.lon, 15);
                }}
                className="flex items-center justify-between rounded-sm px-1 py-1 text-left text-sm transition-colors hover:bg-surface-elevated"
              >
                <span className="truncate text-foreground">{n.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {distanceKm.toFixed(2)} km
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  );
}

function RouteDetail({ routeId }: { routeId: string }) {
  const { routeById } = useNetworkData();
  const route = routeById.get(routeId);

  if (!route) return null;

  return (
    <CardContent className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: route.color }}
            aria-hidden="true"
          />
          <p className="font-display text-lg font-semibold">{route.longName}</p>
        </div>
        {route.shortName && (
          <Badge variant="accent" className="mt-2">
            {route.shortName}
          </Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Field label="Route ID">{route.id}</Field>
        <Field label="Color">{route.color}</Field>
        <Field label="Total stops">{route.stationIds.length.toLocaleString("en-IN")}</Field>
        <Field label="Total trips">{route.tripCount.toLocaleString("en-IN")}</Field>
        <Field label="Polyline length">{route.polylineLengthKm.toFixed(2)} km</Field>
        <Field label="Shape ID">{route.shapeId ?? "—"}</Field>
      </dl>
    </CardContent>
  );
}

export function NetworkInfoPanel() {
  const { selectedStationId, selectedRouteId } = useMapContext();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Details</CardTitle>
        <CardDescription>
          {selectedStationId
            ? "Selected station"
            : selectedRouteId
              ? "Selected route"
              : "Select a station or route on the map to inspect it here."}
        </CardDescription>
      </CardHeader>

      {selectedStationId && <StationDetail stationId={selectedStationId} />}
      {selectedRouteId && <RouteDetail routeId={selectedRouteId} />}
      {!selectedStationId && !selectedRouteId && (
        <CardContent>
          <EmptyState
            icon={MousePointerClick}
            title="Nothing selected"
            description="Click a station or line on the map, or pick a search result, to see its real GTFS details."
            className="min-h-[240px]"
          />
        </CardContent>
      )}
    </Card>
  );
}
