import { StationsExplorer } from "@/components/dashboard/stations-explorer";
import { getAllStations } from "@/services/gtfs/station.service";

export const metadata = { title: "Stations" };

export default function StationsPage() {
  const stations = getAllStations();

  return (
    <div className="flex h-full flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">Stations</h1>
        <p className="text-sm text-muted-foreground">
          Every station in the DMRC GTFS feed — {stations.length.toLocaleString("en-IN")} total.
        </p>
      </div>

      <StationsExplorer stations={stations} />
    </div>
  );
}
