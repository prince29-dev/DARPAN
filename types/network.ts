import type { RouteSummary } from "@/types/route";
import type { Station } from "@/types/station";

/**
 * A station enriched with network-topology facts derived from GTFS
 * `stop_times.txt` + `trips.txt` (which routes call here, whether it is
 * an interchange or a line terminus, and its nearest neighbours by real
 * coordinate distance). Nothing here is fabricated — every field is
 * computed by `services/gtfs/network.service.ts` from the same GTFS
 * Engine dataset Milestone 4 introduced.
 */
export interface NetworkStation extends Station {
  routeIds: string[];
  isInterchange: boolean;
  isTerminal: boolean;
  tripCount: number;
  nearbyStationIds: string[];
}

export interface NetworkRoutePoint {
  lat: number;
  lon: number;
}

/**
 * A route enriched with the geometry and ordered station sequence needed
 * to render it on the map. `path` comes from the GTFS shape linked to the
 * route's representative trip (the trip with the most stops, i.e. the
 * full end-to-end run); `stationIds` is that same trip's stop sequence.
 * `color` resolves the route's GTFS `route_color` when present, falling
 * back to a deterministic presentation-layer palette (see
 * `services/map/route-colors.ts`) when the feed leaves it blank — DMRC's
 * feed does not populate `route_color`, so this is a display choice, not
 * invented transit data.
 */
export interface NetworkRoute extends RouteSummary {
  color: string;
  shapeId: string | null;
  path: NetworkRoutePoint[];
  stationIds: string[];
  polylineLengthKm: number;
}

export interface NetworkRouteExtreme {
  id: string;
  label: string;
  value: number;
}

export interface NetworkAnalytics {
  totalStations: number;
  totalRoutes: number;
  totalShapes: number;
  totalTrips: number;
  totalInterchanges: number;
  averageStopsPerTrip: number;
  largestRoute: NetworkRouteExtreme | null;
  smallestRoute: NetworkRouteExtreme | null;
  longestShape: NetworkRouteExtreme | null;
  shortestShape: NetworkRouteExtreme | null;
}

export type NetworkMarkerVariant =
  | "normal"
  | "interchange"
  | "terminal"
  | "selected"
  | "hovered";

export type NetworkSearchScope = "station" | "route" | "trip";

export interface NetworkSearchResult {
  scope: NetworkSearchScope;
  id: string;
  title: string;
  subtitle: string;
}
