"use client";

import { MapPinned } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PredictionSnapshotBanner } from "@/components/dashboard/prediction-snapshot-banner";
import { SearchInput } from "@/components/dashboard/search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Station } from "@/types/station";

export function StationsExplorer({ stations }: { stations: Station[] }) {
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return stations;
    return stations.filter((station) => station.name.toLowerCase().includes(normalized));
  }, [stations, query]);

  const selected = React.useMemo(
    () => stations.find((station) => station.id === selectedId) ?? null,
    [stations, selectedId],
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PredictionSnapshotBanner scopeLabel="stations" />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search stations by name…"
        />
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {filtered.length.toLocaleString("en-IN")} of {stations.length.toLocaleString("en-IN")}{" "}
          stations
        </span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {filtered.length === 0 ? (
          <Card className="flex items-center justify-center p-10">
            <EmptyState
              icon={MapPinned}
              title="No stations match"
              description={`No station name contains "${query}". Try a different search term.`}
            />
          </Card>
        ) : (
          <div className="scrollbar-thin grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((station) => (
              <button
                key={station.id}
                type="button"
                onClick={() => setSelectedId(station.id)}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-accent/40",
                  selectedId === station.id && "border-accent bg-surface-elevated",
                )}
              >
                <span className="truncate text-sm font-medium text-foreground">
                  {station.name}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  ID {station.id}
                </span>
              </button>
            ))}
          </div>
        )}

        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              {selected ? "Selected station" : "Select a station to inspect it here."}
            </CardDescription>
          </CardHeader>
          {selected && (
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="font-display text-lg font-semibold">{selected.name}</p>
                <Badge variant="accent" className="mt-2">
                  Station ID {selected.id}
                </Badge>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Latitude</dt>
                  <dd className="font-mono tabular-nums">{selected.lat.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Longitude</dt>
                  <dd className="font-mono tabular-nums">{selected.lon.toFixed(6)}</dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Per-station arrival predictions aren&rsquo;t available yet — the live Prediction
                Engine feed uses a different vehicle ID space than DMRC stations. See the network
                snapshot above for current live figures.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
