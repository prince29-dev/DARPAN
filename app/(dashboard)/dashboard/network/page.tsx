import { NetworkExplorer } from "@/components/network/network-explorer";
import {
  getNetworkAnalytics,
  getNetworkBounds,
  getNetworkRoutes,
  getNetworkStations,
} from "@/services/gtfs/network.service";
import { getAllTrips } from "@/services/gtfs/trip.service";

export default function NetworkPage() {
  const stations = getNetworkStations();
  const routes = getNetworkRoutes();
  const analytics = getNetworkAnalytics();
  const bounds = getNetworkBounds();
  const trips = getAllTrips();

  return (
    <NetworkExplorer
      stations={stations}
      routes={routes}
      analytics={analytics}
      bounds={bounds}
      trips={trips}
    />
  );
}
