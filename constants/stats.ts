import { formatIndianNumber } from "@/lib/utils";
import type { GtfsStatistics } from "@/services/gtfs/statistics";

export interface NetworkStat {
  label: string;
  value: number;
  display: string;
}

export function buildNetworkStats(stats: GtfsStatistics): NetworkStat[] {
  return [
    { label: "Stations", value: stats.stationCount, display: stats.stationCount.toLocaleString("en-IN") },
    { label: "Routes", value: stats.routeCount, display: stats.routeCount.toLocaleString("en-IN") },
    { label: "Trips", value: stats.tripCount, display: formatIndianNumber(stats.tripCount) },
    {
      label: "Stop Times",
      value: stats.stopTimeCount,
      display: formatIndianNumber(stats.stopTimeCount),
    },
  ];
}
