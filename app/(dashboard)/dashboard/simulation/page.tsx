import { SlidersHorizontal } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "Simulation" };

export default function SimulationPage() {
  return (
    <ComingSoon
      icon={SlidersHorizontal}
      title="Simulation"
      description="Scenario modeling and what-if analysis arrive with the Simulation Engine in a later milestone."
    />
  );
}
