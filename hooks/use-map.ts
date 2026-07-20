"use client";

import { useMapContext } from "@/components/map/map-context";
import type { MapLayer, MapViewState } from "@/types/map";

export function useMapView(): MapViewState {
  return useMapContext().view;
}

export function useMapLayers(): {
  layers: MapLayer[];
  toggleLayer: ReturnType<typeof useMapContext>["toggleLayer"];
} {
  const { layers, toggleLayer } = useMapContext();
  return { layers, toggleLayer };
}

export function useMapZoom(): {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
} {
  const { view, zoomIn, zoomOut, setZoom } = useMapContext();
  return { zoom: view.zoom, zoomIn, zoomOut, setZoom };
}

export function useMapSelection(): {
  selectedStationId: string | null;
  selectedRouteId: string | null;
  selectStation: (id: string | null) => void;
  selectRoute: (id: string | null) => void;
} {
  const { selectedStationId, selectedRouteId, selectStation, selectRoute } = useMapContext();
  return { selectedStationId, selectedRouteId, selectStation, selectRoute };
}

export function useMapHover(): {
  hoveredStationId: string | null;
  hoveredRouteId: string | null;
  setHoveredStation: (id: string | null) => void;
  setHoveredRoute: (id: string | null) => void;
} {
  const { hoveredStationId, hoveredRouteId, setHoveredStation, setHoveredRoute } =
    useMapContext();
  return { hoveredStationId, hoveredRouteId, setHoveredStation, setHoveredRoute };
}

export function useMapFlyTo(): {
  flyTarget: ReturnType<typeof useMapContext>["flyTarget"];
  flyTo: (lat: number, lng: number, zoom?: number) => void;
} {
  const { flyTarget, flyTo } = useMapContext();
  return { flyTarget, flyTo };
}

export function useMapEngineStatus(): {
  status: ReturnType<typeof useMapContext>["status"];
  reportEngineStatus: (status: ReturnType<typeof useMapContext>["status"]) => void;
} {
  const { status, reportEngineStatus } = useMapContext();
  return { status, reportEngineStatus };
}
