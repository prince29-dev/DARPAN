import {
  Activity,
  Brain,
  Radio,
  Route as RouteIcon,
  Satellite,
  TrainFront,
  Waypoints,
} from "lucide-react";

import type { StatCardProps } from "@/components/dashboard/stat-card";
import type { GtfsStatistics } from "@/services/gtfs/statistics";

export function buildOverviewStats(stats: GtfsStatistics): Omit<StatCardProps, "className">[] {
  return [
    {
      label: "Stations",
      icon: Waypoints,
      status: "connected",
      value: stats.stationCount.toLocaleString("en-IN"),
      hint: "Parsed from stops.txt in the DMRC GTFS Static feed.",
    },
    {
      label: "Routes",
      icon: RouteIcon,
      status: "connected",
      value: stats.routeCount.toLocaleString("en-IN"),
      hint: "Parsed from routes.txt in the DMRC GTFS Static feed.",
    },
    {
      label: "Trips",
      icon: TrainFront,
      status: "connected",
      value: stats.tripCount.toLocaleString("en-IN"),
      hint: "Parsed from trips.txt in the DMRC GTFS Static feed.",
    },
    {
      label: "Stop Times",
      icon: Satellite,
      status: "connected",
      value: stats.stopTimeCount.toLocaleString("en-IN"),
      hint: "Parsed from stop_times.txt in the DMRC GTFS Static feed.",
    },
    {
      label: "GTFS Feed",
      icon: Satellite,
      status: "connected",
      value: "Live",
      hint: `${stats.agencyName} · ${stats.serviceCount} service calendar(s) loaded.`,
    },
    {
      label: "Operational Status",
      icon: Activity,
      status: "offline",
      hint: "Reflects live service health once Live Operations connects.",
    },
    {
      label: "Realtime API",
      icon: Radio,
      status: "offline",
      hint: "GTFS-Realtime feed status will surface here.",
    },
    {
      label: "Prediction Status",
      icon: Brain,
      status: "offline",
      hint: "AI Engine health once prediction models are deployed.",
    },
  ];
}

export interface OverviewChartConfig {
  title: string;
  description: string;
}

export const OVERVIEW_CHARTS: OverviewChartConfig[] = [
  {
    title: "Ridership Trend",
    description: "Daily ridership over time, once the Realtime/Analytics Engine is connected.",
  },
  {
    title: "Trips",
    description: "Scheduled vs. completed trips per day.",
  },
  {
    title: "Network Health",
    description: "Composite uptime across stations, routes, and realtime feeds.",
  },
  {
    title: "Station Distribution",
    description: "Passenger load distribution across the network.",
  },
  {
    title: "Service Status",
    description: "Live incident and disruption timeline.",
  },
];
