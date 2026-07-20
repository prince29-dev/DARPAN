"use client";

import { useMapContext } from "@/components/map/map-context";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL = {
  connected: "Connected",
  connecting: "Connecting…",
  offline: "Offline",
} as const;

export function MapStatus() {
  const { status } = useMapContext();

  return (
    <Badge variant={status === "connected" ? "signal" : "outline"}>
      Map Engine · {STATUS_LABEL[status]}
    </Badge>
  );
}
