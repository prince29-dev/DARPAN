"use client";

import * as React from "react";

import type { NetworkRoute, NetworkSearchResult, NetworkStation } from "@/types/network";
import type { Trip } from "@/types/trip";

const DEBOUNCE_MS = 150;
const MAX_RESULTS = 40;

export interface UseNetworkSearchArgs {
  stations: NetworkStation[];
  routes: NetworkRoute[];
  trips: Trip[];
}

export interface UseNetworkSearchResult {
  query: string;
  setQuery: (value: string) => void;
  debouncedQuery: string;
  results: NetworkSearchResult[];
}

function routeById(routes: NetworkRoute[]): Map<string, NetworkRoute> {
  return new Map(routes.map((route) => [route.id, route]));
}

/**
 * Instant search across stations, routes, and trips. Debounced so typing
 * quickly doesn't re-filter three arrays (262 + 36 + 5,438 records) on
 * every keystroke.
 */
export function useNetworkSearch({
  stations,
  routes,
  trips,
}: UseNetworkSearchArgs): UseNetworkSearchResult {
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const routeIndex = React.useMemo(() => routeById(routes), [routes]);

  const results = React.useMemo<NetworkSearchResult[]>(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) return [];

    const matches: NetworkSearchResult[] = [];

    for (const station of stations) {
      if (matches.length >= MAX_RESULTS) break;
      if (station.name.toLowerCase().includes(normalized) || station.id === normalized) {
        matches.push({
          scope: "station",
          id: station.id,
          title: station.name,
          subtitle: station.isInterchange ? "Interchange station" : `Stop ID ${station.id}`,
        });
      }
    }

    for (const route of routes) {
      if (matches.length >= MAX_RESULTS) break;
      if (
        route.longName.toLowerCase().includes(normalized) ||
        (route.shortName?.toLowerCase().includes(normalized) ?? false) ||
        route.id === normalized
      ) {
        matches.push({
          scope: "route",
          id: route.id,
          title: route.longName,
          subtitle: `${route.stationIds.length} stops · Route ID ${route.id}`,
        });
      }
    }

    for (const trip of trips) {
      if (matches.length >= MAX_RESULTS) break;
      if (trip.id.toLowerCase().includes(normalized)) {
        const route = routeIndex.get(trip.routeId);
        matches.push({
          scope: "trip",
          id: trip.id,
          title: `Trip ${trip.id}`,
          subtitle: route ? route.longName : `Route ${trip.routeId}`,
        });
      }
    }

    return matches;
  }, [debouncedQuery, stations, routes, trips, routeIndex]);

  return { query, setQuery, debouncedQuery, results };
}
