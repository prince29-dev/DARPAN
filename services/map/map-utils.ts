import type { LatLng } from "@/types/map";

export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function formatCoordinate(point: LatLng): string {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}

export function isValidLatLng(point: Partial<LatLng>): point is LatLng {
  return (
    typeof point.lat === "number" &&
    typeof point.lng === "number" &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}
