import "server-only";

import { loadGtfsDataset } from "@/services/gtfs/loader";
import type { RouteSummary } from "@/types/route";

let cachedRoutes: RouteSummary[] | null = null;

function countTripsPerRoute(trips: { route_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const trip of trips) {
    counts.set(trip.route_id, (counts.get(trip.route_id) ?? 0) + 1);
  }
  return counts;
}

export function getAllRoutes(): RouteSummary[] {
  if (cachedRoutes) return cachedRoutes;

  const { routes, trips } = loadGtfsDataset();
  const tripCounts = countTripsPerRoute(trips);

  cachedRoutes = routes
    .map((route) => ({
      id: route.route_id,
      shortName: route.route_short_name.length > 0 ? route.route_short_name : null,
      longName: route.route_long_name,
      color: route.route_color.length > 0 ? route.route_color : null,
      textColor: route.route_text_color.length > 0 ? route.route_text_color : null,
      type: Number.parseInt(route.route_type, 10),
      tripCount: tripCounts.get(route.route_id) ?? 0,
    }))
    .sort((a, b) => a.longName.localeCompare(b.longName));

  return cachedRoutes;
}

export function getRouteById(id: string): RouteSummary | undefined {
  return getAllRoutes().find((route) => route.id === id);
}

export function getRouteCount(): number {
  return loadGtfsDataset().routes.length;
}
