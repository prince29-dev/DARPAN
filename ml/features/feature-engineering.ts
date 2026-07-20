/**
 * ============================================================================
 * DARPAN — Milestone 9.1: Dataset Generation Pipeline
 * Module: Feature Engineering
 * ============================================================================
 *
 * Pure function: real `RealtimeVehicle` observations + real
 * `VehiclePrediction` results in, `DatasetRow[]` out. No I/O, no
 * randomness, no fabricated values — every column is either read
 * directly off the live feed or copied from an already-computed
 * deterministic Prediction Engine result. See `ml/dataset/types.ts` for
 * the field-by-field provenance of each column.
 */

import type { DatasetRow } from "@/ml/dataset/types";
import type { VehiclePrediction } from "@/types/prediction";
import type { RealtimeVehicle } from "@/types/realtime";

function toRow(vehicle: RealtimeVehicle, prediction: VehiclePrediction): DatasetRow {
  return {
    timestamp: vehicle.timestampMs ?? Date.now(),
    vehicle_id: vehicle.entityId,
    route_id: vehicle.trip.routeId ?? "",
    trip_id: vehicle.trip.tripId ?? "",
    latitude: vehicle.position.lat,
    longitude: vehicle.position.lon,
    speed: vehicle.position.speed,
    bearing: vehicle.position.bearing,
    stop_sequence: vehicle.currentStopSequence,
    congestion_index: prediction.congestion.densityScore,
    deterministic_eta: prediction.eta.etaSeconds,
    deterministic_delay: prediction.delay.predictedDelaySeconds,
  };
}

/**
 * Joins each live vehicle with its matching Prediction Engine result
 * (by `vehicleId` / `entityId`) and produces one `DatasetRow` per
 * matched pair. A vehicle with no corresponding prediction (shouldn't
 * happen — `PredictionEngine.predictBatch()` covers every vehicle it's
 * given — but never assumed) is skipped rather than given fabricated
 * prediction values.
 */
export function buildFeatureRows(
  vehicles: readonly RealtimeVehicle[],
  predictions: readonly VehiclePrediction[],
): DatasetRow[] {
  const predictionByVehicleId = new Map(predictions.map((prediction) => [prediction.vehicleId, prediction]));

  const rows: DatasetRow[] = [];
  for (const vehicle of vehicles) {
    const prediction = predictionByVehicleId.get(vehicle.entityId);
    if (!prediction) continue;
    rows.push(toRow(vehicle, prediction));
  }
  return rows;
}
