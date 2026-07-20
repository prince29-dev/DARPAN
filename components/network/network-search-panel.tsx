"use client";

import { Route as RouteIcon, Search, TrainFront, Waypoints } from "lucide-react";
import * as React from "react";

import { useMapContext } from "@/components/map/map-context";
import { useNetworkData } from "@/components/network/network-data-context";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNetworkSearch } from "@/hooks/use-network-search";
import { cn } from "@/lib/utils";
import type { NetworkSearchResult, NetworkSearchScope } from "@/types/network";
import type { Trip } from "@/types/trip";

const SCOPE_ICON: Record<NetworkSearchScope, typeof Search> = {
  station: Waypoints,
  route: RouteIcon,
  trip: TrainFront,
};

const SCOPE_LABEL: Record<NetworkSearchScope, string> = {
  station: "Stations",
  route: "Routes",
  trip: "Trips",
};

export function NetworkSearchPanel({ trips }: { trips: Trip[] }) {
  const { stations, routes, routeById } = useNetworkData();
  const { selectStation, selectRoute, flyTo } = useMapContext();
  const [scope, setScope] = React.useState<NetworkSearchScope | "all">("all");

  const { query, setQuery, results } = useNetworkSearch({ stations, routes, trips });

  const scoped = React.useMemo(
    () => (scope === "all" ? results : results.filter((r) => r.scope === scope)),
    [results, scope],
  );

  function handleSelect(result: NetworkSearchResult) {
    if (result.scope === "station") {
      const station = stations.find((s) => s.id === result.id);
      if (!station) return;
      selectStation(station.id);
      flyTo(station.lat, station.lon, 15);
      return;
    }

    if (result.scope === "route") {
      const route = routeById.get(result.id);
      if (!route) return;
      selectRoute(route.id);
      const mid = route.path[Math.floor(route.path.length / 2)];
      if (mid) flyTo(mid.lat, mid.lon, 13);
      return;
    }

    // Trip: the map renders routes, not individual trip runs, so route
    // its parent route into view and select that.
    const trip = trips.find((t) => t.id === result.id);
    const route = trip ? routeById.get(trip.routeId) : undefined;
    if (!route) return;
    selectRoute(route.id);
    const mid = route.path[Math.floor(route.path.length / 2)];
    if (mid) flyTo(mid.lat, mid.lon, 13);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 focus-within:border-accent/40">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stations, routes, trips…"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <Tabs value={scope} onValueChange={(v) => setScope(v as NetworkSearchScope | "all")}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="station">Stations</TabsTrigger>
          <TabsTrigger value="route">Routes</TabsTrigger>
          <TabsTrigger value="trip">Trips</TabsTrigger>
        </TabsList>
      </Tabs>

      {query.trim().length > 0 && (
        <div className="scrollbar-thin flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
          {scoped.length === 0 && (
            <p className="px-1 py-3 text-xs text-muted-foreground">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          )}
          {scoped.map((result) => {
            const Icon = SCOPE_ICON[result.scope];
            return (
              <button
                key={`${result.scope}-${result.id}`}
                type="button"
                onClick={() => handleSelect(result)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border border-transparent px-2 py-2 text-left text-sm transition-colors hover:border-border hover:bg-surface-elevated",
                )}
              >
                <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-foreground">{result.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                </span>
                <Badge variant="outline" className="ml-auto shrink-0">
                  {SCOPE_LABEL[result.scope]}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
