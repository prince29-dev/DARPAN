"use client";

import * as React from "react";
import { useMap } from "react-leaflet";

import { CONGESTION_HEX } from "@/components/analytics/analytics-visual-tokens";
import { usePredictionCongestion } from "@/hooks/use-prediction";
import { useVehicles } from "@/hooks/use-realtime";
import { VehicleAnimationManager } from "@/lib/leaflet/vehicle-animation-manager";

export interface VehicleLayerProps {
  /** Milestone 8: colors markers by real, live congestion level from the
   * Prediction Engine instead of the Milestone 6 default color. Off by
   * default — purely additive, existing behavior is unchanged when omitted. */
  showPredictionOverlay?: boolean;
}

export function VehicleLayer({ showPredictionOverlay = false }: VehicleLayerProps) {
  const map = useMap();
  const vehicles = useVehicles();
  const managerRef = React.useRef<VehicleAnimationManager | null>(null);

  // Independent of the realtime poll — its own hook, own loading/error
  // state, so a slow/failed prediction fetch never blocks vehicle markers
  // from rendering (they just keep their default color).
  const congestion = usePredictionCongestion(
    { limit: 500 },
    { enabled: showPredictionOverlay, intervalMs: 20_000 },
  );

  React.useEffect(() => {
    const manager = new VehicleAnimationManager();
    manager.attach(map);
    managerRef.current = manager;
    return () => {
      manager.detach();
      managerRef.current = null;
    };
  }, [map]);

  React.useEffect(() => {
    managerRef.current?.sync(vehicles);
  }, [vehicles]);

  React.useEffect(() => {
    if (!showPredictionOverlay || !congestion.data) {
      managerRef.current?.setCongestionColors(new Map());
      return;
    }
    const colorByVehicleId = new Map(
      congestion.data.map((assessment) => [assessment.vehicleId, CONGESTION_HEX[assessment.level]]),
    );
    managerRef.current?.setCongestionColors(colorByVehicleId);
  }, [showPredictionOverlay, congestion.data]);

  return null;
}
