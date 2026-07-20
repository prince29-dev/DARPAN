import { Clock3, Gauge, TrendingUp, Users2 } from "lucide-react";

import type { StatCardProps } from "@/components/dashboard/stat-card";
import type { OverviewChartConfig } from "@/constants/dashboard-overview";

export const ANALYTICS_KPIS: Omit<StatCardProps, "className">[] = [
  {
    label: "Daily Ridership",
    icon: Users2,
    status: "pending",
    hint: "Aggregated from validated GTFS-Realtime ridership counts.",
  },
  {
    label: "On-Time Performance",
    icon: Clock3,
    status: "pending",
    hint: "Share of trips arriving within schedule tolerance.",
  },
  {
    label: "Peak Load Factor",
    icon: Gauge,
    status: "pending",
    hint: "Busiest segment occupancy relative to capacity.",
  },
  {
    label: "Network Growth",
    icon: TrendingUp,
    status: "pending",
    hint: "Month-over-month change in trips and stop times.",
  },
];

export const ANALYTICS_CHARTS: OverviewChartConfig[] = [
  {
    title: "Ridership by Line",
    description: "Daily boardings broken down by metro line.",
  },
  {
    title: "On-Time Performance Trend",
    description: "Punctuality over the last 30 days, network-wide.",
  },
  {
    title: "Peak Hour Load",
    description: "Occupancy across the busiest corridors by hour.",
  },
  {
    title: "Stop-Time Accuracy",
    description: "Predicted vs. actual arrival deltas.",
  },
];
