"use client";

import { ChevronLeft, ChevronRight, TrainFront } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/dashboard/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Trip } from "@/types/trip";

const PAGE_SIZE = 50;

export function TripsExplorer({ trips }: { trips: Trip[] }) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return trips;
    return trips.filter((trip) => trip.id.toLowerCase().includes(normalized));
  }, [trips, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={handleSearch} placeholder="Search by Trip ID…" />
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {filtered.length.toLocaleString("en-IN")} of {trips.length.toLocaleString("en-IN")} trips
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex items-center justify-center p-10">
          <EmptyState
            icon={TrainFront}
            title="No trips match"
            description={`No trip ID contains "${query}". Try a different search term.`}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-surface-elevated text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Trip ID</th>
                  <th className="px-4 py-3 font-medium">Route ID</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Direction</th>
                  <th className="px-4 py-3 font-medium">Shape ID</th>
                  <th className="px-4 py-3 text-right font-medium">Stops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((trip) => (
                  <tr key={trip.id} className="transition-colors hover:bg-surface-elevated">
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{trip.id}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {trip.routeId}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{trip.serviceId}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {trip.directionId ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {trip.shapeId ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {trip.stopCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
