import "server-only";

import { loadGtfsDataset } from "@/services/gtfs/loader";
import type { Station } from "@/types/station";

let cachedStations: Station[] | null = null;

export function getAllStations(): Station[] {
  if (cachedStations) return cachedStations;

  const { stops } = loadGtfsDataset();

  cachedStations = stops
    .map((stop) => ({
      id: stop.stop_id,
      name: stop.stop_name,
      code: stop.stop_code.length > 0 ? stop.stop_code : null,
      lat: Number.parseFloat(stop.stop_lat),
      lon: Number.parseFloat(stop.stop_lon),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return cachedStations;
}

export function getStationById(id: string): Station | undefined {
  return getAllStations().find((station) => station.id === id);
}

export function getStationCount(): number {
  return loadGtfsDataset().stops.length;
}
