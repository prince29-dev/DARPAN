import {
  BarChart3,
  BookOpen,
  Brain,
  Github,
  LayoutDashboard,
  MapPinned,
  Route as RouteIcon,
  Settings,
  SlidersHorizontal,
  TrainFront,
  Waypoints,
} from "lucide-react";

import type { NavGroup } from "@/types/navigation";

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Network", href: "/dashboard/network", icon: Waypoints },
      { label: "Stations", href: "/dashboard/stations", icon: MapPinned },
      { label: "Routes", href: "/dashboard/routes", icon: RouteIcon },
      { label: "Trips", href: "/dashboard/trips", icon: TrainFront },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Simulation", href: "/dashboard/simulation", icon: SlidersHorizontal },
      { label: "AI Lab", href: "/dashboard/ai-lab", icon: Brain },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Documentation", href: "/dashboard/documentation", icon: BookOpen },
      {
        label: "GitHub",
        href: "https://github.com",
        icon: Github,
        external: true,
      },
    ],
  },
];

export const FLAT_NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);
