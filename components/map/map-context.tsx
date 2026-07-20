"use client";

import * as React from "react";

import { clampZoom, MAX_ZOOM, MIN_ZOOM } from "@/services/map/map-utils";
import type { MapEngineStatus, MapLayer, MapLayerId, MapViewState } from "@/types/map";

const DEFAULT_LAYERS: MapLayer[] = [
  {
    id: "stations",
    label: "Stations",
    description: "Station markers across the network.",
    enabled: true,
  },
  {
    id: "routes",
    label: "Routes",
    description: "Metro line geometries.",
    enabled: true,
  },
  {
    id: "vehicles",
    label: "Live Vehicles",
    description: "Real-time OTD bus positions (Milestone 6).",
    enabled: false,
  },
  {
    id: "prediction-overlay",
    label: "Prediction Overlay",
    description: "Colors live vehicles by real Prediction Engine congestion (Milestone 8).",
    enabled: false,
  },
  {
    id: "heatmap",
    label: "Ridership Heatmap",
    description: "Passenger density overlay.",
    enabled: false,
  },
];

/** An imperative pan/zoom request consumed once by the Leaflet layer. */
export interface FlyTarget {
  lat: number;
  lng: number;
  zoom: number;
  /** Bumped on every request so repeated flights to the same point still fire. */
  requestId: number;
}

interface MapContextValue {
  view: MapViewState;
  layers: MapLayer[];
  status: MapEngineStatus;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleLayer: (id: MapLayerId) => void;
  reportEngineStatus: (status: MapEngineStatus) => void;
  selectedStationId: string | null;
  selectedRouteId: string | null;
  hoveredStationId: string | null;
  hoveredRouteId: string | null;
  selectStation: (id: string | null) => void;
  selectRoute: (id: string | null) => void;
  setHoveredStation: (id: string | null) => void;
  setHoveredRoute: (id: string | null) => void;
  flyTarget: FlyTarget | null;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

const MapContext = React.createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [zoom, setZoomState] = React.useState(MIN_ZOOM);
  const [layers, setLayers] = React.useState<MapLayer[]>(DEFAULT_LAYERS);
  const [status, setStatus] = React.useState<MapEngineStatus>("offline");
  const [selectedStationId, setSelectedStationId] = React.useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = React.useState<string | null>(null);
  const [hoveredStationId, setHoveredStationId] = React.useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = React.useState<string | null>(null);
  const [flyTarget, setFlyTarget] = React.useState<FlyTarget | null>(null);
  const flyRequestId = React.useRef(0);

  const setZoom = React.useCallback((next: number) => {
    setZoomState(clampZoom(next));
  }, []);

  const zoomIn = React.useCallback(() => setZoom(zoom + 1), [zoom, setZoom]);
  const zoomOut = React.useCallback(() => setZoom(zoom - 1), [zoom, setZoom]);

  const toggleLayer = React.useCallback((id: MapLayerId) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, enabled: !layer.enabled } : layer)),
    );
  }, []);

  const reportEngineStatus = React.useCallback((next: MapEngineStatus) => {
    setStatus(next);
  }, []);

  const selectStation = React.useCallback((id: string | null) => {
    setSelectedStationId(id);
    setSelectedRouteId(null);
  }, []);

  const selectRoute = React.useCallback((id: string | null) => {
    setSelectedRouteId(id);
    setSelectedStationId(null);
  }, []);

  const flyTo = React.useCallback((lat: number, lng: number, targetZoom?: number) => {
    flyRequestId.current += 1;
    setFlyTarget({
      lat,
      lng,
      zoom: clampZoom(targetZoom ?? MAX_ZOOM - 2),
      requestId: flyRequestId.current,
    });
  }, []);

  const value = React.useMemo<MapContextValue>(
    () => ({
      view: { center: flyTarget ? { lat: flyTarget.lat, lng: flyTarget.lng } : null, zoom, status },
      layers,
      status,
      setZoom,
      zoomIn,
      zoomOut,
      toggleLayer,
      reportEngineStatus,
      selectedStationId,
      selectedRouteId,
      hoveredStationId,
      hoveredRouteId,
      selectStation,
      selectRoute,
      setHoveredStation: setHoveredStationId,
      setHoveredRoute: setHoveredRouteId,
      flyTarget,
      flyTo,
    }),
    [
      zoom,
      layers,
      status,
      setZoom,
      zoomIn,
      zoomOut,
      toggleLayer,
      reportEngineStatus,
      selectedStationId,
      selectedRouteId,
      hoveredStationId,
      hoveredRouteId,
      selectStation,
      selectRoute,
      flyTarget,
      flyTo,
    ],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext(): MapContextValue {
  const context = React.useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
}

export { MAX_ZOOM, MIN_ZOOM };
