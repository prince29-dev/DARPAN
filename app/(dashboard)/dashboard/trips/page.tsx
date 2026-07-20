import { TripsExplorer } from "@/components/dashboard/trips-explorer";
import { getAllTrips } from "@/services/gtfs/trip.service";

export const metadata = { title: "Trips" };

export default function TripsPage() {
  const trips = getAllTrips();

  return (
    <div className="flex h-full flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">Trips</h1>
        <p className="text-sm text-muted-foreground">
          Every scheduled trip in the DMRC GTFS feed — {trips.length.toLocaleString("en-IN")} total.
        </p>
      </div>

      <TripsExplorer trips={trips} />
    </div>
  );
}
