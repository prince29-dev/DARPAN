/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Service: Congestion
 * ============================================================================
 *
 * Unlike ETA and Delay, congestion here is *not* a seeded placeholder — it
 * is computed directly from real, current vehicle positions supplied by
 * the Realtime Engine: how many other live vehicles are within a fixed
 * radius of this one, right now. That makes it a genuine (if coarse)
 * spatial-density signal rather than a synthetic number, while still
 * being clearly a heuristic proxy for congestion rather than a measured
 * traffic condition — it has no visibility into road geometry, lane
 * count, or signal timing.
 *
 * Reuses `haversineKm` from `services/map/geo.ts` (Milestone 5) rather
 * than re-implementing distance math — one great-circle-distance
 * function for the whole codebase.
 *
 * SOLID: Single Responsibility — this service only assesses congestion.
 * It has no knowledge of ETA or delay, and `ICongestionService` is the
 * seam `PredictionEngine` depends on instead of this concrete class.
 *
 * ----------------------------------------------------------------------
 * Milestone 8 performance fix
 * ----------------------------------------------------------------------
 * `assess()` alone is O(n) per call; calling it once per vehicle (as
 * `PredictionEngine.predictBatch()` originally did) makes a full batch
 * O(n²) — ~2.8s for the real 5,356-vehicle feed, the root cause of the
 * "20+ second" analytics responses. `assessBatch()` below builds a
 * spatial grid once (bucket size ≥ `ANALYSIS_RADIUS_KM`, so a 5×5
 * neighborhood search around a vehicle's own cell is guaranteed to
 * contain every real neighbor within the radius — this changes *how*
 * candidates are found, never *which* ones count, so results are
 * identical to the brute-force version, just computed in O(n) average
 * time instead of O(n²)). `assess()` itself is untouched and still used
 * for genuine single-vehicle lookups, where O(n) was already fine.
 */

import { haversineKm } from "@/services/map/geo";
import { clamp, roundTo } from "@/services/prediction/utils/deterministic-math";
import type { CongestionAssessment, CongestionLevel } from "@/types/congestion";
import type { RealtimeVehicle } from "@/types/realtime";

/** Radius, in kilometers, searched around a vehicle for neighbors. */
const ANALYSIS_RADIUS_KM = 0.5;

/** Neighbor count at or above which density is considered fully saturated (score = 1). */
const DENSITY_SATURATION_COUNT = 8;

/** Density-score breakpoints for the coarse `CongestionLevel` classification. */
const LEVEL_THRESHOLDS: ReadonlyArray<{ maxScore: number; level: CongestionLevel }> = [
  { maxScore: 0.2, level: "low" },
  { maxScore: 0.5, level: "moderate" },
  { maxScore: 0.8, level: "high" },
  { maxScore: 1.0, level: "severe" },
];

function classify(densityScore: number): CongestionLevel {
  for (const bucket of LEVEL_THRESHOLDS) {
    if (densityScore <= bucket.maxScore) return bucket.level;
  }
  return "severe";
}

function buildAssessment(vehicleId: string, nearbyVehicleCount: number): CongestionAssessment {
  const densityScore = roundTo(clamp(nearbyVehicleCount / DENSITY_SATURATION_COUNT, 0, 1), 3);
  return {
    vehicleId,
    level: classify(densityScore),
    nearbyVehicleCount,
    analysisRadiusKm: ANALYSIS_RADIUS_KM,
    densityScore,
    computedAtMs: Date.now(),
  };
}

/**
 * Grid cell size in degrees. 0.005° ≈ 0.55 km of latitude — always ≥
 * `ANALYSIS_RADIUS_KM` — and a conservative bound for longitude
 * compression up to very high latitudes (irrelevant for this feed's
 * Delhi/NCR extent, but safe generally). A 5×5 neighborhood (2 cells in
 * every direction) then spans well over 2× the analysis radius from any
 * point inside the center cell, so no true neighbor can be missed.
 */
const GRID_CELL_DEGREES = 0.005;
const NEIGHBORHOOD_RADIUS_CELLS = 2;

function cellIndex(value: number): number {
  return Math.floor(value / GRID_CELL_DEGREES);
}

function cellKey(latIndex: number, lonIndex: number): string {
  return `${latIndex}:${lonIndex}`;
}

/**
 * Contract `PredictionEngine` depends on (Dependency Inversion) instead
 * of the concrete `CongestionService` — allows a future, more accurate
 * implementation (e.g. one that also weighs road segment capacity) to be
 * swapped in without touching the engine or the other services.
 */
export interface ICongestionService {
  /**
   * Assesses local congestion for `target` given the full set of
   * currently-live vehicles it should be compared against. O(n) — fine
   * for single-vehicle lookups, but never call this once per vehicle
   * over a large fleet; use `assessBatch()` instead.
   */
  assess(target: RealtimeVehicle, allVehicles: readonly RealtimeVehicle[]): CongestionAssessment;

  /**
   * Assesses every vehicle in `vehicles` against every other vehicle in
   * the same set, in O(n) average time via spatial bucketing. Returns
   * results identical to calling `assess()` once per vehicle — just
   * computed far more cheaply. This is the path `PredictionEngine`
   * should use for any batch of more than a handful of vehicles.
   */
  assessBatch(vehicles: readonly RealtimeVehicle[]): Map<string, CongestionAssessment>;
}

export class CongestionService implements ICongestionService {
  assess(target: RealtimeVehicle, allVehicles: readonly RealtimeVehicle[]): CongestionAssessment {
    let nearbyVehicleCount = 0;

    for (const candidate of allVehicles) {
      if (candidate.entityId === target.entityId) continue;
      const distanceKm = haversineKm(target.position, candidate.position);
      if (distanceKm <= ANALYSIS_RADIUS_KM) {
        nearbyVehicleCount += 1;
      }
    }

    return buildAssessment(target.entityId, nearbyVehicleCount);
  }

  assessBatch(vehicles: readonly RealtimeVehicle[]): Map<string, CongestionAssessment> {
    // Build the spatial grid once — O(n).
    const grid = new Map<string, RealtimeVehicle[]>();
    for (const vehicle of vehicles) {
      const key = cellKey(cellIndex(vehicle.position.lat), cellIndex(vehicle.position.lon));
      const bucket = grid.get(key);
      if (bucket) {
        bucket.push(vehicle);
      } else {
        grid.set(key, [vehicle]);
      }
    }

    const results = new Map<string, CongestionAssessment>();

    for (const target of vehicles) {
      const targetLatIndex = cellIndex(target.position.lat);
      const targetLonIndex = cellIndex(target.position.lon);
      let nearbyVehicleCount = 0;

      for (let dLat = -NEIGHBORHOOD_RADIUS_CELLS; dLat <= NEIGHBORHOOD_RADIUS_CELLS; dLat += 1) {
        for (let dLon = -NEIGHBORHOOD_RADIUS_CELLS; dLon <= NEIGHBORHOOD_RADIUS_CELLS; dLon += 1) {
          const candidates = grid.get(cellKey(targetLatIndex + dLat, targetLonIndex + dLon));
          if (!candidates) continue;

          for (const candidate of candidates) {
            if (candidate.entityId === target.entityId) continue;
            if (haversineKm(target.position, candidate.position) <= ANALYSIS_RADIUS_KM) {
              nearbyVehicleCount += 1;
            }
          }
        }
      }

      results.set(target.entityId, buildAssessment(target.entityId, nearbyVehicleCount));
    }

    return results;
  }
}
