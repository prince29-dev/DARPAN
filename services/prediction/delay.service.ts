/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Service: Schedule Delay
 * ============================================================================
 *
 * See `types/delay.ts` for the full rationale. The one rule this service
 * never breaks: it does not compute a delay figure for a trip whose own
 * `schedule_relationship` says it has no schedule to be delayed against
 * (anything other than `SCHEDULED` — in the live OTD feed, that's roughly
 * two-thirds of all trips). Returning `null` there is the correct answer,
 * not a gap to be filled in with a guess.
 *
 * For trips that *do* have a schedule reference, this Phase 1 delay
 * figure is a deterministic seeded placeholder — see the module doc in
 * `eta.service.ts` for why route/schedule-shape data isn't available yet
 * to compute a real one.
 *
 * SOLID: Single Responsibility — this service only estimates delay. It
 * takes the already-computed `EtaEstimate` as input rather than
 * recomputing anything ETA-related itself.
 */

import {
  clamp,
  hashToUnitInterval,
  mapToRange,
  roundTo,
} from "@/services/prediction/utils/deterministic-math";
import type { DelayCategory, DelayEstimate } from "@/types/delay";
import type { EtaEstimate } from "@/types/eta";
import type { RealtimeVehicle } from "@/types/realtime";

/** Deterministic placeholder delay bounds, in seconds (negative = early). */
const MIN_DELAY_SECONDS = -90;
const MAX_DELAY_SECONDS = 360;

/** Delay-category breakpoints, in seconds. */
const EARLY_THRESHOLD_SECONDS = -30;
const ON_TIME_THRESHOLD_SECONDS = 120;
const MAJOR_DELAY_THRESHOLD_SECONDS = 300;

/** Confidence penalty applied because the delay figure is itself a
 * seeded placeholder, even when a schedule reference does exist. */
const DELAY_CONFIDENCE_FACTOR = 0.8;

function classify(delaySeconds: number): DelayCategory {
  if (delaySeconds <= EARLY_THRESHOLD_SECONDS) return "early";
  if (delaySeconds <= ON_TIME_THRESHOLD_SECONDS) return "on-time";
  if (delaySeconds <= MAJOR_DELAY_THRESHOLD_SECONDS) return "minor-delay";
  return "major-delay";
}

/**
 * Contract `PredictionEngine` depends on instead of the concrete
 * `DelayService` (Dependency Inversion) — a future implementation backed
 * by real schedule-adherence data can conform to the same interface.
 */
export interface IDelayService {
  estimate(vehicle: RealtimeVehicle, eta: EtaEstimate): DelayEstimate;
}

export class DelayService implements IDelayService {
  estimate(vehicle: RealtimeVehicle, eta: EtaEstimate): DelayEstimate {
    if (vehicle.trip.scheduleRelationship !== "SCHEDULED") {
      return {
        vehicleId: vehicle.entityId,
        predictedDelaySeconds: null,
        category: "unknown",
        reason: this.explainNoSchedule(vehicle),
        confidence: 0,
        computedAtMs: Date.now(),
      };
    }

    const seed = `${vehicle.entityId}:delay`;
    const predictedDelaySeconds = Math.round(
      mapToRange(hashToUnitInterval(seed), MIN_DELAY_SECONDS, MAX_DELAY_SECONDS),
    );

    return {
      vehicleId: vehicle.entityId,
      predictedDelaySeconds,
      category: classify(predictedDelaySeconds),
      reason:
        "Deterministic placeholder estimate — Phase 1 has no real schedule-adherence model yet; " +
        "see Milestone 7 Phase 2+.",
      confidence: roundTo(clamp(eta.confidence * DELAY_CONFIDENCE_FACTOR, 0, 0.95), 2),
      computedAtMs: Date.now(),
    };
  }

  private explainNoSchedule(vehicle: RealtimeVehicle): string {
    const relationship = vehicle.trip.scheduleRelationship ?? "UNKNOWN";
    return (
      `No static schedule reference: this trip's schedule_relationship is "${relationship}", ` +
      "not SCHEDULED, so there is no timetable to measure a delay against."
    );
  }
}
