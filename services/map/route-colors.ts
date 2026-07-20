/**
 * DMRC's `routes.txt` leaves `route_color` blank for every row, so the
 * map has nothing real to render lines with. Rather than fabricate GTFS
 * data, this module assigns each route a color from a fixed, curated,
 * colorblind-conscious palette — a presentation decision, generated
 * deterministically from the route's own `route_id` so it is stable
 * across reloads and never invented per-render. `network.service.ts`
 * still prefers a real `route_color` from the feed when one exists.
 */

const PALETTE = [
  "#E5484D", // red
  "#FFB020", // amber (signal accent — reused deliberately)
  "#F5D90A", // yellow
  "#3FB950", // green
  "#00C2B2", // teal (brand accent)
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#F97316", // orange
  "#14B8A6", // cyan-teal
  "#A855F7", // purple
  "#84CC16", // lime
  "#06B6D4", // sky
  "#D946EF", // magenta
  "#EAB308", // gold
  "#F43F5E", // rose
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic palette color for a given route id. */
export function getRouteColor(routeId: string): string {
  const index = hashString(routeId) % PALETTE.length;
  return PALETTE[index] ?? PALETTE[0];
}
