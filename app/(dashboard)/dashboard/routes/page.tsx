import { PredictionSnapshotBanner } from "@/components/dashboard/prediction-snapshot-banner";
import { RouteCard } from "@/components/dashboard/route-card";
import { getAllRoutes } from "@/services/gtfs/route.service";

export const metadata = { title: "Routes" };

export default function RoutesPage() {
  const routes = getAllRoutes();

  return (
    <div className="flex h-full flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">Routes</h1>
        <p className="text-sm text-muted-foreground">
          Every route in the DMRC GTFS feed — {routes.length.toLocaleString("en-IN")} total.
        </p>
      </div>

      <PredictionSnapshotBanner scopeLabel="routes" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
