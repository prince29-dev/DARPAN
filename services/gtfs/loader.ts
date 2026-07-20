import "server-only";

import fs from "node:fs";
import path from "node:path";

import { getOrSetCache } from "@/services/gtfs/cache";
import {
  parseAgency,
  parseCalendar,
  parseRoutes,
  parseShapes,
  parseStopTimes,
  parseStops,
  parseTrips,
  type GtfsAgencyRow,
  type GtfsCalendarRow,
  type GtfsRouteRow,
  type GtfsShapeRow,
  type GtfsStopRow,
  type GtfsStopTimeRow,
  type GtfsTripRow,
} from "@/services/gtfs/parser";

const GTFS_DIR = path.join(process.cwd(), "data", "gtfs");

export interface GtfsDataset {
  agency: GtfsAgencyRow[];
  calendar: GtfsCalendarRow[];
  routes: GtfsRouteRow[];
  stops: GtfsStopRow[];
  trips: GtfsTripRow[];
  stopTimes: GtfsStopTimeRow[];
  shapes: GtfsShapeRow[];
}

function readGtfsFile(fileName: string): string {
  const filePath = path.join(GTFS_DIR, fileName);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error(
      `GTFS Engine: unable to read "${fileName}" from ${GTFS_DIR}. Ensure the DMRC GTFS files are present in data/gtfs/. (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
  }
}

export function loadGtfsDataset(): GtfsDataset {
  return getOrSetCache("gtfs-dataset", () => ({
    agency: parseAgency(readGtfsFile("agency.txt")),
    calendar: parseCalendar(readGtfsFile("calendar.txt")),
    routes: parseRoutes(readGtfsFile("routes.txt")),
    stops: parseStops(readGtfsFile("stops.txt")),
    trips: parseTrips(readGtfsFile("trips.txt")),
    stopTimes: parseStopTimes(readGtfsFile("stop_times.txt")),
    shapes: parseShapes(readGtfsFile("shapes.txt")),
  }));
}
