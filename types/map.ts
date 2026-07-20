export interface LatLng {
  lat: number;
  lng: number;
}

export type MapLayerId = "stations" | "routes" | "vehicles" | "prediction-overlay" | "heatmap";

export interface MapLayer {
  id: MapLayerId;
  label: string;
  description: string;
  enabled: boolean;
}

export type MapEngineStatus = "connected" | "connecting" | "offline";

export interface MapViewState {
  center: LatLng | null;
  zoom: number;
  status: MapEngineStatus;
}
