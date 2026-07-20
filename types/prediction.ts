/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Domain: Prediction Envelope (composition root types)
 * ============================================================================
 *
 * This file defines the shapes that compose the three prediction domains
 * (`types/eta.ts`, `types/delay.ts`, `types/congestion.ts`) into one
 * result, and the disclaimer contract every Prediction API response
 * carries. See `services/prediction/prediction.service.ts` for the engine
 * that produces `VehiclePrediction`, and `docs/ARCHITECTURE.md` § Milestone
 * 7 for the full design rationale.
 */

import type { CongestionAssessment } from "@/types/congestion";
import type { DelayEstimate } from "@/types/delay";
import type { EtaEstimate } from "@/types/eta";

/**
 * Identifies the prediction methodology so every API consumer can tell,
 * programmatically, that Phase 1 output is a deterministic heuristic —
 * not a trained model. Phase 2+ will introduce new values here (e.g.
 * `"gradient-boosted-v1"`) rather than silently changing what this one
 * means.
 */
export type PredictionMethodology = "deterministic-heuristic-v1";

/**
 * One vehicle's complete prediction bundle — ETA, delay, and congestion,
 * composed by `PredictionEngine.predict()`.
 */
export interface VehiclePrediction {
  vehicleId: string;
  tripId: string | null;
  routeId: string | null;

  eta: EtaEstimate;
  delay: DelayEstimate;
  congestion: CongestionAssessment;

  /** Blend of `eta.confidence` and `delay.confidence` into one headline number. */
  overallConfidence: number;

  methodology: PredictionMethodology;

  /** Epoch milliseconds when this bundle was assembled. */
  generatedAtMs: number;
}

/**
 * Carried on every Prediction API response so no consumer — human or
 * machine — can mistake Phase 1 output for a validated ML prediction.
 */
export interface PredictionDisclaimer {
  isMachineLearning: false;
  isMock: true;
  methodology: PredictionMethodology;
  notes: string;
}

/** Generic envelope shared by the eta/delay/congestion list endpoints. */
export interface PredictionListResponse<T> {
  disclaimer: PredictionDisclaimer;
  count: number;
  totalAvailable: number;
  generatedAtMs: number;
  results: T[];
}

/** Generic envelope shared by the eta/delay/congestion single-vehicle endpoints. */
export interface PredictionSingleResponse<T> {
  disclaimer: PredictionDisclaimer;
  generatedAtMs: number;
  result: T;
}

/** Shape of `GET /api/prediction/status`. */
export interface PredictionEngineStatus {
  status: "operational" | "degraded" | "unavailable";
  methodology: PredictionMethodology;
  isMachineLearning: false;
  isMock: true;
  /** Vehicles currently available from the Realtime Engine to predict against. */
  availableVehicles: number;
  /** `RealtimeSnapshot.fetchedAtMs` from the underlying Realtime Engine. */
  lastRealtimeUpdateMs: number | null;
  endpoints: string[];
  generatedAtMs: number;
}
