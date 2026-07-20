import { Brain, Layers, LineChart, MapPin, Radio, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const FEATURES: Feature[] = [
  {
    title: "Digital Twin",
    description:
      "A living virtual replica of Delhi Metro's stations, routes, and trips, kept in sync with the real network.",
    icon: Layers,
  },
  {
    title: "Simulation",
    description:
      "Model service disruptions, schedule changes, and crowding scenarios before they happen in the real world.",
    icon: Waves,
  },
  {
    title: "Analytics",
    description:
      "Network-wide ridership, punctuality, and performance metrics surfaced in real time.",
    icon: LineChart,
  },
  {
    title: "AI Prediction",
    description:
      "Delay detection, ETA forecasting, and crowding prediction powered by machine learning.",
    icon: Brain,
  },
  {
    title: "Realtime Monitoring",
    description:
      "Live train positions and service health streamed from GTFS-Realtime feeds.",
    icon: Radio,
  },
  {
    title: "Interactive Mapping",
    description:
      "Explore the network on a fully interactive, layered map of stations and routes.",
    icon: MapPin,
  },
];
