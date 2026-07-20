import "server-only";

import { loadGtfsDataset } from "@/services/gtfs/loader";
import type { Trip } from "@/types/trip";

let cachedTrips: Trip[] | null = null;

function countStopsPerTrip(stopTimes: { trip_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const stopTime of stopTimes) {
    counts.set(stopTime.trip_id, (counts.get(stopTime.trip_id) ?? 0) + 1);
  }
  return counts;
}

export function getAllTrips(): Trip[] {
  if (cachedTrips) return cachedTrips;

  const { trips, stopTimes } = loadGtfsDataset();
  const stopCounts = countStopsPerTrip(stopTimes);

  cachedTrips = trips.map((trip) => ({
    id: trip.trip_id,
    routeId: trip.route_id,
    serviceId: trip.service_id,
    headsign: trip.trip_headsign.length > 0 ? trip.trip_headsign : null,
    shortName: trip.trip_short_name.length > 0 ? trip.trip_short_name : null,
    directionId: trip.direction_id.length > 0 ? Number.parseInt(trip.direction_id, 10) : null,
    shapeId: trip.shape_id.length > 0 ? trip.shape_id : null,
    stopCount: stopCounts.get(trip.trip_id) ?? 0,
  }));

  return cachedTrips;
}

export function getTripById(id: string): Trip | undefined {
  return getAllTrips().find((trip) => trip.id === id);
}

export function getTripCount(): number {
  return loadGtfsDataset().trips.length;
}
