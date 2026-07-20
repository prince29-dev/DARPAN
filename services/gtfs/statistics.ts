import "server-only";

import { loadGtfsDataset } from "@/services/gtfs/loader";

export interface GtfsStatistics {
  agencyName: string;
  stationCount: number;
  routeCount: number;
  tripCount: number;
  stopTimeCount: number;
  shapeCount: number;
  serviceCount: number;
}

let cachedStatistics: GtfsStatistics | null = null;

export function getGtfsStatistics(): GtfsStatistics {
  if (cachedStatistics) return cachedStatistics;

  const { agency, stops, routes, trips, stopTimes, shapes, calendar } = loadGtfsDataset();
  const uniqueShapeIds = new Set(shapes.map((point) => point.shape_id));

  cachedStatistics = {
    agencyName: agency[0]?.agency_name ?? "Unknown agency",
    stationCount: stops.length,
    routeCount: routes.length,
    tripCount: trips.length,
    stopTimeCount: stopTimes.length,
    shapeCount: uniqueShapeIds.size,
    serviceCount: calendar.length,
  };

  return cachedStatistics;
}
