"use client";

import { HEALTH_BAND_BADGE_VARIANT } from "@/components/analytics/analytics-visual-tokens";
import { Badge } from "@/components/ui/badge";
import { useNetworkHealth } from "@/hooks/use-analytics";

/** Milestone 8 map "Health overlay": the live Network Health score,
 * shown next to the existing Map Engine status badge. Purely additive —
 * renders nothing extra on the map canvas itself. */
export function NetworkHealthBadge() {
  const { data, loading } = useNetworkHealth();

  if (loading || !data) {
    return <Badge variant="outline">Network Health · —</Badge>;
  }

  return (
    <Badge variant={HEALTH_BAND_BADGE_VARIANT[data.band]}>
      Network Health · {data.score} ({data.band})
    </Badge>
  );
}
