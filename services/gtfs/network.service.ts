import "server-only";

import type { GtfsStopTimeRow } from "@/services/gtfs/parser";
import { loadGtfsDataset } from "@/services/gtfs/loader";
import { getAllRoutes } from "@/services/gtfs/route.service";
import { getShapeById, getShapeIds } from "@/services/gtfs/shape.service";
import { getAllStations } from "@/services/gtfs/station.service";
import { getAllTrips } from "@/services/gtfs/trip.service";
import { boundsOf, haversineKm, polylineLengthKm } from "@/services/map/geo";
import { getRouteColor } from "@/services/map/route-colors";
import type { Trip } from "@/types/trip";
import type {
  NetworkAnalytics,
  NetworkRoute,
  NetworkRouteExtreme,
  NetworkRoutePoint,
  NetworkStation,
} from "@/types/network";
import type { LatLngBounds } from "@/services/map/geo";

const NEARBY_STATION_COUNT = 5;

interface NetworkGraph {
  stations: NetworkStation[];
  routes: NetworkRoute[];
  analytics: NetworkAnalytics;
  bounds: LatLngBounds | null;
}

let cachedGraph: NetworkGraph | null = null;

function groupStopTimesByTrip(stopTimes: GtfsStopTimeRow[]): Map<string, GtfsStopTimeRow[]> {
  const byTrip = new Map<string, GtfsStopTimeRow[]>();
  for (const row of stopTimes) {
    const bucket = byTrip.get(row.trip_id);
    if (bucket) {
      bucket.push(row);
    } else {
      byTrip.set(row.trip_id, [row]);
    }
  }
  for (const bucket of byTrip.values()) {
    bucket.sort(
      (a, b) => Number.parseInt(a.stop_sequence, 10) - Number.parseInt(b.stop_sequence, 10),
    );
  }
  return byTrip;
}

/** The trip with the most stops for a route — its full end-to-end run. */
function pickRepresentativeTrip(trips: Trip[]): Trip | undefined {
  return trips.reduce<Trip | undefined>((best, trip) => {
    if (!best || trip.stopCount > best.stopCount) return trip;
    return best;
  }, undefined);
}

function buildGraph(): NetworkGraph {
  const { stopTimes } = loadGtfsDataset();
  const stations = getAllStations();
  const routeSummaries = getAllRoutes();
  const trips = getAllTrips();

  const stopTimesByTrip = groupStopTimesByTrip(stopTimes);
  const tripsByRoute = new Map<string, Trip[]>();
  for (const trip of trips) {
    const bucket = tripsByRoute.get(trip.routeId);
    if (bucket) {
      bucket.push(trip);
    } else {
      tripsByRoute.set(trip.routeId, [trip]);
    }
  }

  const stationRouteIds = new Map<string, Set<string>>();
  const stationTripCount = new Map<string, number>();

  const tripById = new Map<string, Trip>();
  for (const trip of trips) tripById.set(trip.id, trip);

  for (const row of stopTimes) {
    const trip = tripById.get(row.trip_id);
    if (!trip) continue;

    stationTripCount.set(row.stop_id, (stationTripCount.get(row.stop_id) ?? 0) + 1);

    const routeSet = stationRouteIds.get(row.stop_id);
    if (routeSet) {
      routeSet.add(trip.routeId);
    } else {
      stationRouteIds.set(row.stop_id, new Set([trip.routeId]));
    }
  }

  const stationById = new Map(stations.map((station) => [station.id, station]));
  const terminalStationIds = new Set<string>();

  const routes: NetworkRoute[] = routeSummaries.map((route) => {
    const routeTrips = tripsByRoute.get(route.id) ?? [];
    const repTrip = pickRepresentativeTrip(routeTrips);
    const repStopTimes = repTrip ? (stopTimesByTrip.get(repTrip.id) ?? []) : [];
    const stationIds = repStopTimes.map((row) => row.stop_id);

    const firstStationId = stationIds[0];
    const lastStationId = stationIds[stationIds.length - 1];
    if (firstStationId) terminalStationIds.add(firstStationId);
    if (lastStationId) terminalStationIds.add(lastStationId);

    const shapeId = repTrip?.shapeId ?? null;
    const shape = shapeId ? getShapeById(shapeId) : undefined;

    const path: NetworkRoutePoint[] = shape
      ? shape.points.map((point) => ({ lat: point.lat, lon: point.lon }))
      : [];

    if (path.length === 0 && stationIds.length > 0) {
      // No shape on this route's representative trip — fall back to the
      // real station coordinates in stop order rather than render nothing.
      for (const id of stationIds) {
        const s = stationById.get(id);
        if (s) path.push({ lat: s.lat, lon: s.lon });
      }
    }

    return {
      ...route,
      color: normalizeHexColor(route.color) ?? getRouteColor(route.id),
      shapeId,
      path,
      stationIds,
      polylineLengthKm: polylineLengthKm(path),
    };
  });

  const networkStations: NetworkStation[] = stations.map((station) => {
    const routeIds = Array.from(stationRouteIds.get(station.id) ?? []);

    const distances = stations
      .filter((other) => other.id !== station.id)
      .map((other) => ({
        id: other.id,
        distanceKm: haversineKm(station, other),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, NEARBY_STATION_COUNT);

    return {
      ...station,
      routeIds,
      isInterchange: routeIds.length > 1,
      isTerminal: terminalStationIds.has(station.id),
      tripCount: stationTripCount.get(station.id) ?? 0,
      nearbyStationIds: distances.map((d) => d.id),
    };
  });

  const analytics = buildAnalytics(networkStations, routes, trips);
  const bounds = boundsOf(stations);

  return { stations: networkStations, routes, analytics, bounds };
}

function normalizeHexColor(value: string | null): string | null {
  if (!value) return null;
  return value.startsWith("#") ? value : `#${value}`;
}

function toExtreme(id: string, label: string, value: number): NetworkRouteExtreme {
  return { id, label, value };
}

function buildAnalytics(
  stations: NetworkStation[],
  routes: NetworkRoute[],
  trips: Trip[],
): NetworkAnalytics {
  let largestRoute: NetworkRouteExtreme | null = null;
  let smallestRoute: NetworkRouteExtreme | null = null;

  for (const route of routes) {
    const stopCount = route.stationIds.length;
    if (stopCount === 0) continue;

    if (!largestRoute || stopCount > largestRoute.value) {
      largestRoute = toExtreme(route.id, route.longName, stopCount);
    }
    if (!smallestRoute || stopCount < smallestRoute.value) {
      smallestRoute = toExtreme(route.id, route.longName, stopCount);
    }
  }

  let longestShape: NetworkRouteExtreme | null = null;
  let shortestShape: NetworkRouteExtreme | null = null;

  for (const shapeId of getShapeIds()) {
    const shape = getShapeById(shapeId);
    if (!shape) continue;

    const lengthKm = polylineLengthKm(shape.points.map((p) => ({ lat: p.lat, lon: p.lon })));
    if (lengthKm <= 0) continue;

    if (!longestShape || lengthKm > longestShape.value) {
      longestShape = toExtreme(shapeId, shapeId, lengthKm);
    }
    if (!shortestShape || lengthKm < shortestShape.value) {
      shortestShape = toExtreme(shapeId, shapeId, lengthKm);
    }
  }

  const totalStopCount = trips.reduce((sum, trip) => sum + trip.stopCount, 0);
  const averageStopsPerTrip = trips.length > 0 ? totalStopCount / trips.length : 0;

  return {
    totalStations: stations.length,
    totalRoutes: routes.length,
    totalShapes: getShapeIds().length,
    totalTrips: trips.length,
    totalInterchanges: stations.filter((s) => s.isInterchange).length,
    averageStopsPerTrip,
    largestRoute,
    smallestRoute,
    longestShape,
    shortestShape,
  };
}

function getGraph(): NetworkGraph {
  if (!cachedGraph) {
    cachedGraph = buildGraph();
  }
  return cachedGraph;
}

export function getNetworkStations(): NetworkStation[] {
  return getGraph().stations;
}

export function getNetworkRoutes(): NetworkRoute[] {
  return getGraph().routes;
}

export function getNetworkAnalytics(): NetworkAnalytics {
  return getGraph().analytics;
}

export function getNetworkBounds(): LatLngBounds | null {
  return getGraph().bounds;
}

export function getNetworkStationById(id: string): NetworkStation | undefined {
  return getGraph().stations.find((station) => station.id === id);
}

export function getNetworkRouteById(id: string): NetworkRoute | undefined {
  return getGraph().routes.find((route) => route.id === id);
}
