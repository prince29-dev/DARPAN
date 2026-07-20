/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Domain: Estimated Time of Arrival (ETA)
 * ============================================================================
 *
 * IMPORTANT — read before wiring this into any UI:
 * The live OTD VehiclePositions feed this engine consumes has no matching
 * static schedule or route-shape geometry (see Milestone 6's architecture
 * notes — it is a different agency's bus feed from the DMRC static GTFS).
 * That means there is no real "next stop" or "remaining route distance"
 * this engine can measure yet. Phase 1 therefore produces a fully
 * *deterministic* (seeded, reproducible, never `Math.random()`) synthetic
 * estimate so the architecture, contracts, and UI can be built and tested
 * end-to-end now. `speedSource` and `confidence` on every result exist
 * specifically so a consumer can tell a grounded number from a
 * placeholder one. Phase 2+ replaces the synthetic distance model with a
 * real one once a matching static feed (or the DMRC shapes) is available.
 */

/** How the effective speed used in an ETA calculation was obtained. */
export type EtaSpeedSource = "reported" | "assumed";

/**
 * One vehicle's estimated-time-of-arrival result. Every numeric field is
 * a pure function of the input `RealtimeVehicle` (and, for
 * `congestionAdjustment`, the corresponding `CongestionAssessment`) — the
 * same inputs always produce the same outputs.
 */
export interface EtaEstimate {
  /** The vehicle this estimate is about (RealtimeVehicle.entityId). */
  vehicleId: string;

  /** Deterministic placeholder remaining distance, in kilometers. */
  remainingDistanceKm: number;

  /** Speed, in km/h, actually used to compute the estimate below. */
  effectiveSpeedKmh: number;

  /** Whether `effectiveSpeedKmh` came from the feed's own `speed` field
   * or was assumed because the feed didn't report a usable one. */
  speedSource: EtaSpeedSource;

  /** Multiplier applied to the base speed for local congestion (< 1.0
   * slows the estimate down, 1.0 = no adjustment). Traces back to the
   * `CongestionAssessment` passed into the estimator. */
  congestionAdjustment: number;

  /** Estimated remaining travel time, in seconds. */
  etaSeconds: number;

  /** Estimated arrival time, in epoch milliseconds. */
  etaTimestampMs: number;

  /**
   * Self-reported estimate quality in [0, 1], based on how much real
   * signal (reported speed, bearing, stop context) underlies the number
   * — not a machine-learning confidence score. Low by design when the
   * feed reports little.
   */
  confidence: number;

  /** Epoch milliseconds when this estimate was computed. */
  computedAtMs: number;
}
