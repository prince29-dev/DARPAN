import type { NetworkRoutePoint } from "@/types/network";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two real coordinates, in kilometres.
 * Used for "nearby stations" and shape/route length — never for
 * generating coordinates, only for measuring ones already parsed from
 * GTFS.
 */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total length of an ordered GTFS shape polyline, in kilometres. */
export function polylineLengthKm(points: NetworkRoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;
    total += haversineKm(prev, curr);
  }
  return total;
}

export interface LatLngBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

/** Bounding box for a set of real coordinates — used for initial map fit. */
export function boundsOf(points: { lat: number; lon: number }[]): LatLngBounds | null {
  if (points.length === 0) return null;

  let south = 90;
  let west = 180;
  let north = -90;
  let east = -180;

  for (const point of points) {
    if (point.lat < south) south = point.lat;
    if (point.lat > north) north = point.lat;
    if (point.lon < west) west = point.lon;
    if (point.lon > east) east = point.lon;
  }

  return { south, west, north, east };
}
