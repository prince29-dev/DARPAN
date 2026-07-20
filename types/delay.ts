/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Domain: Schedule Delay
 * ============================================================================
 *
 * "Delay" is only a meaningful concept relative to a published schedule.
 * GTFS-Realtime encodes this directly on every trip via
 * `schedule_relationship`: a `SCHEDULED` trip has a timetable to be early,
 * on-time, or late against; an `ADDED` trip (the majority of entities in
 * the live OTD feed — see Milestone 6's field audit) explicitly does not.
 * `DelayService` respects that distinction — it never invents a delay
 * figure for a trip the feed itself says has no schedule to be delayed
 * against.
 */

export type DelayCategory = "early" | "on-time" | "minor-delay" | "major-delay" | "unknown";

/**
 * One vehicle's predicted schedule adherence. `predictedDelaySeconds` is
 * intentionally nullable — a null value is a correct, honest answer for
 * any trip without a schedule reference, not a missing-data gap.
 */
export interface DelayEstimate {
  /** The vehicle this estimate is about (RealtimeVehicle.entityId). */
  vehicleId: string;

  /**
   * Positive = running late, negative = running early, in seconds.
   * `null` when the trip has no schedule reference to measure against
   * (see `reason`).
   */
  predictedDelaySeconds: number | null;

  /** Coarse bucket derived from `predictedDelaySeconds`. */
  category: DelayCategory;

  /** Human-readable explanation of how this result was derived, or why
   * it's null. Always populated. */
  reason: string;

  /** Self-reported estimate quality in [0, 1]. 0 when `predictedDelaySeconds`
   * is null. Otherwise derived from the input `EtaEstimate.confidence`. */
  confidence: number;

  /** Epoch milliseconds when this estimate was computed. */
  computedAtMs: number;
}
