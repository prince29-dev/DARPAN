/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Domain: Congestion
 * ============================================================================
 *
 * Congestion here is a *spatial density proxy*, not a validated traffic
 * model: it is derived from how many other live vehicles are clustered
 * near a given vehicle's real, current position. That makes it the one
 * prediction domain in Phase 1 that is grounded entirely in measured data
 * (real lat/lon from the Realtime Engine) rather than a seeded heuristic —
 * see `services/prediction/congestion.service.ts` for the computation.
 *
 * It is still a proxy, not ground truth (it cannot see road geometry,
 * lane count, or signal timing), so it is documented as a heuristic and
 * never presented as a measured traffic condition.
 */

/**
 * Coarse congestion classification derived from nearby-vehicle density.
 * Ordered low → severe for straightforward UI thresholding.
 */
export type CongestionLevel = "low" | "moderate" | "high" | "severe";

/**
 * Result of assessing one vehicle's local congestion at a single point in
 * time. Every field is derived from the live vehicle snapshot supplied to
 * `CongestionService.assess()` — nothing here is randomly generated.
 */
export interface CongestionAssessment {
  /** The vehicle this assessment is about (RealtimeVehicle.entityId). */
  vehicleId: string;

  /** Coarse classification for UI display. */
  level: CongestionLevel;

  /** Count of other live vehicles within `analysisRadiusKm` of this one. */
  nearbyVehicleCount: number;

  /** Radius, in kilometers, used for the neighbor search. */
  analysisRadiusKm: number;

  /**
   * Normalized density score in [0, 1]: 0 = no nearby vehicles observed,
   * 1 = at or above the configured saturation threshold. This is a
   * relative proxy for "how clustered is traffic here right now", not a
   * calibrated vehicles-per-lane-km measurement.
   */
  densityScore: number;

  /** Epoch milliseconds when this assessment was computed. */
  computedAtMs: number;
}
