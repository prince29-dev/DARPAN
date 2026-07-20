import { History } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Engine events and operator actions will appear here once connected.
        </CardDescription>
      </CardHeader>
      <EmptyState
        icon={History}
        title="No activity yet"
        description="This feed activates once the Simulation engine comes online."
        className="min-h-0 py-10"
      />
    </Card>
  );
}
