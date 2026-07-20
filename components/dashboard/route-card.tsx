import { Route as RouteIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RouteSummary } from "@/types/route";

export function RouteCard({ route }: { route: RouteSummary }) {
  return (
    <Card className="transition-colors hover:border-accent/30">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-surface-elevated">
            <RouteIcon className="size-4 text-accent" strokeWidth={1.75} />
          </div>
          <Badge variant="outline" className="shrink-0">
            {route.tripCount.toLocaleString("en-IN")} trips
          </Badge>
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{route.longName}</CardTitle>
          <CardDescription className="font-mono text-xs">
            Route ID {route.id}
            {route.shortName ? ` · ${route.shortName}` : ""}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
