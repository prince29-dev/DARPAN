/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Service: Estimated Time of Arrival (ETA)
 * ============================================================================
 *
 * See `types/eta.ts` for the full rationale. Short version: the live feed
 * has no matching route geometry yet, so `remainingDistanceKm` is a
 * deterministic (seeded by `vehicle.entityId`) placeholder rather than a
 * measured value — and every result says so via `speedSource` and
 * `confidence` rather than presenting itself as precise.
 *
 * What *is* real here: `effectiveSpeedKmh` prefers the feed's own
 * reported `speed` whenever it's a usable, non-zero value, and the
 * congestion adjustment is driven by `CongestionService`'s genuine
 * spatial measurement (Dependency Inversion — this service depends on a
 * `CongestionAssessment`-shaped input, not on how it was computed).
 *
 * SOLID: Single Responsibility — this service only estimates ETA. It
 * takes a `CongestionAssessment` as a parameter rather than computing
 * congestion itself, so `PredictionEngine` controls composition order.
 */

import {
  clamp,
  hashToUnitInterval,
  mapToRange,
  roundTo,
} from "@/services/prediction/utils/deterministic-math";
import type { CongestionAssessment, CongestionLevel } from "@/types/congestion";
import type { EtaEstimate, EtaSpeedSource } from "@/types/eta";
import type { RealtimeVehicle } from "@/types/realtime";

/** Deterministic placeholder remaining-distance bounds, in kilometers. */
const MIN_REMAINING_DISTANCE_KM = 0.5;
const MAX_REMAINING_DISTANCE_KM = 10;

/** Deterministic placeholder assumed-speed bounds, in km/h, when the feed
 * doesn't report a usable speed (matches typical urban bus speeds). */
const MIN_ASSUMED_SPEED_KMH = 12;
const MAX_ASSUMED_SPEED_KMH = 34;

/** A reported speed at or below this (m/s) is treated as "not usable" —
 * the current OTD feed always reports exactly 0, which would otherwise
 * make every ETA infinite. */
const MIN_USABLE_REPORTED_SPEED_MPS = 0.5;

const METERS_PER_SECOND_TO_KM_PER_HOUR = 3.6;
const SECONDS_PER_HOUR = 3600;

/** How much a given congestion level slows the effective speed down. */
const CONGESTION_SPEED_MULTIPLIER: Record<CongestionLevel, number> = {
  low: 1.0,
  moderate: 0.85,
  high: 0.65,
  severe: 0.45,
};

/** Never let congestion (or a low assumed speed) drive effective speed to zero. */
const MIN_EFFECTIVE_SPEED_KMH = 3;

/**
 * Contract `PredictionEngine` depends on instead of the concrete
 * `EtaService` (Dependency Inversion) — a future implementation backed by
 * real route-shape distance can conform to the same interface.
 */
export interface IEtaService {
  estimate(vehicle: RealtimeVehicle, congestion: CongestionAssessment): EtaEstimate;
}

export class EtaService implements IEtaService {
  estimate(vehicle: RealtimeVehicle, congestion: CongestionAssessment): EtaEstimate {
    const seed = vehicle.entityId;

    const remainingDistanceKm = mapToRange(
      hashToUnitInterval(`${seed}:remaining-distance`),
      MIN_REMAINING_DISTANCE_KM,
      MAX_REMAINING_DISTANCE_KM,
    );

    const { speedKmh: baseSpeedKmh, source: speedSource } = this.resolveBaseSpeed(vehicle, seed);

    const congestionAdjustment = CONGESTION_SPEED_MULTIPLIER[congestion.level];
    const effectiveSpeedKmh = Math.max(MIN_EFFECTIVE_SPEED_KMH, baseSpeedKmh * congestionAdjustment);

    const etaSeconds = Math.round((remainingDistanceKm / effectiveSpeedKmh) * SECONDS_PER_HOUR);
    const anchorMs = vehicle.timestampMs ?? Date.now();
    const etaTimestampMs = anchorMs + etaSeconds * 1000;

    return {
      vehicleId: vehicle.entityId,
      remainingDistanceKm: roundTo(remainingDistanceKm, 2),
      effectiveSpeedKmh: roundTo(effectiveSpeedKmh, 2),
      speedSource,
      congestionAdjustment,
      etaSeconds,
      etaTimestampMs,
      confidence: this.computeConfidence(vehicle, speedSource),
      computedAtMs: Date.now(),
    };
  }

  /** Prefers the feed's own reported speed; falls back to a deterministic,
   * seeded assumption only when the reported value isn't usable. */
  private resolveBaseSpeed(
    vehicle: RealtimeVehicle,
    seed: string,
  ): { speedKmh: number; source: EtaSpeedSource } {
    const reportedSpeedMps = vehicle.position.speed;

    if (reportedSpeedMps !== null && reportedSpeedMps >= MIN_USABLE_REPORTED_SPEED_MPS) {
      return { speedKmh: reportedSpeedMps * METERS_PER_SECOND_TO_KM_PER_HOUR, source: "reported" };
    }

    const assumedSpeedKmh = mapToRange(
      hashToUnitInterval(`${seed}:assumed-speed`),
      MIN_ASSUMED_SPEED_KMH,
      MAX_ASSUMED_SPEED_KMH,
    );
    return { speedKmh: assumedSpeedKmh, source: "assumed" };
  }

  /** Confidence reflects how much real signal underlies the estimate — a
   * data-completeness score, not a machine-learning certainty. */
  private computeConfidence(vehicle: RealtimeVehicle, speedSource: EtaSpeedSource): number {
    let score = speedSource === "reported" ? 0.55 : 0.35;
    if (vehicle.position.bearing !== null) score += 0.1;
    if (vehicle.trip.scheduleRelationship === "SCHEDULED") score += 0.1;
    if (vehicle.currentStatus !== null) score += 0.05;
    return roundTo(clamp(score, 0, 0.95), 2);
  }
}
