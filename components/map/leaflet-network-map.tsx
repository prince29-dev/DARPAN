"use client";

import "leaflet/dist/leaflet.css";

import * as React from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";

import { useMapContext } from "@/components/map/map-context";
import { VehicleLayer } from "@/components/map/vehicle-layer";
import { DELHI_FALLBACK_CENTER, DELHI_FALLBACK_ZOOM, OSM_ATTRIBUTION, OSM_TILE_URL } from "@/lib/leaflet/config";
import { getStationIcon } from "@/lib/leaflet/icons";
import type { LatLngBounds } from "@/services/map/geo";
import { MAX_ZOOM, MIN_ZOOM } from "@/services/map/map-utils";
import type { NetworkMarkerVariant, NetworkRoute, NetworkStation } from "@/types/network";

export interface LeafletNetworkMapProps {
  stations: NetworkStation[];
  routes: NetworkRoute[];
  bounds: LatLngBounds | null;
  hiddenRouteIds?: ReadonlySet<string>;
}

function stationVariant(
  station: NetworkStation,
  selectedStationId: string | null,
  hoveredStationId: string | null,
): NetworkMarkerVariant {
  if (station.id === selectedStationId) return "selected";
  if (station.id === hoveredStationId) return "hovered";
  if (station.isInterchange) return "interchange";
  if (station.isTerminal) return "terminal";
  return "normal";
}

/** Bridges imperative `flyTo` requests from MapContext into the live Leaflet map instance. */
function FlyToController() {
  const map = useMap();
  const { flyTarget } = useMapContext();
  const lastRequestId = React.useRef(0);

  React.useEffect(() => {
    if (!flyTarget || flyTarget.requestId === lastRequestId.current) return;
    lastRequestId.current = flyTarget.requestId;
    map.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom, { duration: 0.8 });
  }, [flyTarget, map]);

  return null;
}

/** Reports live tile-load status back into MapContext so MapStatus reflects reality. */
function EngineStatusReporter() {
  const map = useMap();
  const { reportEngineStatus } = useMapContext();

  React.useEffect(() => {
    reportEngineStatus("connecting");

    function handleLoad() {
      reportEngineStatus("connected");
    }

    map.whenReady(handleLoad);
    return () => {
      reportEngineStatus("offline");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

function RouteLayer({ route }: { route: NetworkRoute }) {
  const { selectedRouteId, hoveredRouteId, selectRoute, setHoveredRoute, flyTo } =
    useMapContext();
  const isSelected = route.id === selectedRouteId;
  const isHovered = route.id === hoveredRouteId;
  const positions = React.useMemo<[number, number][]>(
    () => route.path.map((p) => [p.lat, p.lon]),
    [route.path],
  );

  if (positions.length < 2) return null;

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: route.color,
        weight: isSelected ? 6 : isHovered ? 4.5 : 3,
        opacity: isSelected || isHovered ? 1 : 0.75,
        lineCap: "round",
        lineJoin: "round",
      }}
      eventHandlers={{
        click: () => {
          selectRoute(route.id);
          const midpoint = route.path[Math.floor(route.path.length / 2)];
          if (midpoint) flyTo(midpoint.lat, midpoint.lon, 13);
        },
        mouseover: () => setHoveredRoute(route.id),
        mouseout: () => setHoveredRoute(null),
      }}
    >
      <Tooltip sticky>
        {route.longName} · {route.stationIds.length} stops
      </Tooltip>
    </Polyline>
  );
}

function StationLayer({ station }: { station: NetworkStation }) {
  const {
    selectedStationId,
    hoveredStationId,
    selectStation,
    setHoveredStation,
    flyTo,
  } = useMapContext();

  const variant = stationVariant(station, selectedStationId, hoveredStationId);
  const icon = React.useMemo(() => getStationIcon(variant), [variant]);

  return (
    <Marker
      position={[station.lat, station.lon]}
      icon={icon}
      eventHandlers={{
        click: () => {
          selectStation(station.id);
          flyTo(station.lat, station.lon, 15);
        },
        mouseover: () => setHoveredStation(station.id),
        mouseout: () => setHoveredStation(null),
      }}
    >
      <Tooltip>
        {station.name}
        {station.isInterchange ? " · Interchange" : ""}
      </Tooltip>
    </Marker>
  );
}

/** Keeps MapContext's zoom (driven by the ZoomControl overlay) and the live Leaflet zoom in sync, both ways. */
function ZoomSyncController() {
  const map = useMap();
  const { view, setZoom } = useMapContext();
  const lastKnownZoom = React.useRef(map.getZoom());
  const isFirstCommand = React.useRef(true);

  React.useEffect(() => {
    function handleZoomEnd() {
      const current = map.getZoom();
      lastKnownZoom.current = current;
      setZoom(current);
    }
    map.on("zoomend", handleZoomEnd);
    // Pull the map's real zoom (after its initial fitBounds) into context
    // immediately, rather than waiting for the first user-driven zoomend.
    handleZoomEnd();
    return () => {
      map.off("zoomend", handleZoomEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  React.useEffect(() => {
    // Skip the render that fires right after the sync above — it reflects
    // the map's own fitBounds zoom, not an external zoom command, and
    // pushing it back into `map.setZoom` would just undo the fitBounds.
    if (isFirstCommand.current) {
      isFirstCommand.current = false;
      return;
    }
    if (view.zoom !== lastKnownZoom.current) {
      lastKnownZoom.current = view.zoom;
      map.setZoom(view.zoom);
    }
  }, [view.zoom, map]);

  return null;
}

export function LeafletNetworkMap({ stations, routes, bounds, hiddenRouteIds }: LeafletNetworkMapProps) {
  const { layers } = useMapContext();
  const stationsEnabled = layers.find((l) => l.id === "stations")?.enabled ?? true;
  const routesEnabled = layers.find((l) => l.id === "routes")?.enabled ?? true;
  const vehiclesEnabled = layers.find((l) => l.id === "vehicles")?.enabled ?? false;
  const predictionOverlayEnabled = layers.find((l) => l.id === "prediction-overlay")?.enabled ?? false;

  const visibleRoutes = React.useMemo(
    () => (hiddenRouteIds && hiddenRouteIds.size > 0
      ? routes.filter((route) => !hiddenRouteIds.has(route.id))
      : routes),
    [routes, hiddenRouteIds],
  );

  const initialCenter: [number, number] = bounds
    ? [(bounds.north + bounds.south) / 2, (bounds.east + bounds.west) / 2]
    : DELHI_FALLBACK_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={DELHI_FALLBACK_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      bounds={bounds ? [[bounds.south, bounds.west], [bounds.north, bounds.east]] : undefined}
      boundsOptions={{ padding: [32, 32] }}
      className="size-full"
      style={{ background: "#101215" }}
      scrollWheelZoom
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />

      {routesEnabled &&
        visibleRoutes.map((route) => <RouteLayer key={route.id} route={route} />)}

      {stationsEnabled &&
        stations.map((station) => <StationLayer key={station.id} station={station} />)}

      <FlyToController />
      <EngineStatusReporter />
      <ZoomSyncController />
      {vehiclesEnabled && <VehicleLayer showPredictionOverlay={predictionOverlayEnabled} />}
    </MapContainer>
  );
}
