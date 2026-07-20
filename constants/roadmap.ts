export interface MilestoneEntry {
  title: string;
  description: string;
  status: "done" | "current" | "upcoming";
}

export const MILESTONES: MilestoneEntry[] = [
  {
    title: "Foundation Architecture",
    description: "Design system, primitives, and project structure.",
    status: "done",
  },
  {
    title: "Application Shell",
    description: "Sidebar, top navigation, command palette, mobile navigation.",
    status: "done",
  },
  {
    title: "Landing & Dashboard UI",
    description: "Public landing experience and the enterprise dashboard redesign.",
    status: "done",
  },
  {
    title: "GTFS Engine",
    description: "Static feed parsing for stations, routes, trips, and stop times — live now.",
    status: "current",
  },
  {
    title: "Interactive Map",
    description: "Render the parsed network on a real map, backed by shapes.txt geometry.",
    status: "upcoming",
  },
  {
    title: "Realtime & Simulation Engines",
    description: "Live vehicle positions, service health, and scenario modeling.",
    status: "upcoming",
  },
  {
    title: "AI Engine",
    description: "ETA prediction, delay detection, and crowding forecasts.",
    status: "upcoming",
  },
];

export const RESEARCH_GOALS: string[] = [
  "Publish an open dataset-driven benchmark for Indian transit digital twins.",
  "Evaluate delay and crowding prediction models against real Delhi Metro operations.",
  "Study simulation fidelity for large-scale metro disruption scenarios.",
  "Explore transferability of the platform to bus and rail networks.",
];
