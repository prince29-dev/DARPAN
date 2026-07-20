/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Service: PredictionEngine (composition root)
 * ============================================================================
 *
 * Composes the three single-responsibility services into one prediction
 * per vehicle. The internal call order is intentionally
 * Congestion → ETA → Delay — not the Congestion-last ordering the initial
 * "PredictionEngine ↓ ETA ↓ Delay ↓ Congestion" sketch shows, because ETA
 * genuinely depends on congestion (it adjusts effective speed) and Delay
 * genuinely depends on ETA (its confidence is derived from ETA's). Every
 * dependency in this engine flows one direction, so there's no cycle and
 * no service reaches back into one that runs after it. This ordering
 * decision is called out explicitly per the "explain first, then
 * implement" project rule.
 *
 * SOLID:
 *  - Single Responsibility: this class's only job is composition + batching.
 *  - Open/Closed: new prediction domains can be added as a new constructor
 *    dependency + a new field on `VehiclePrediction` without modifying the
 *    three existing services.
 *  - Dependency Inversion: depends on `ICongestionService` / `IEtaService`
 *    / `IDelayService` interfaces, not the concrete classes. Defaults are
 *    provided for convenience, but every dependency is constructor-
 *    injectable for testing or future swaps (e.g. a real ML-backed
 *    `IEtaService` in Phase 2+ — this engine wouldn't need to change).
 */

import { CongestionService, type ICongestionService } from "@/services/prediction/congestion.service";
import { DelayService, type IDelayService } from "@/services/prediction/delay.service";
import { EtaService, type IEtaService } from "@/services/prediction/eta.service";
import { clamp, roundTo } from "@/services/prediction/utils/deterministic-math";
import type { PredictionMethodology, VehiclePrediction } from "@/types/prediction";
import type { RealtimeVehicle } from "@/types/realtime";

/** Identifies this engine's approach — see `types/prediction.ts`. */
const METHODOLOGY: PredictionMethodology = "deterministic-heuristic-v1";

/**
 * Contract the Prediction API routes depend on (Dependency Inversion)
 * instead of the concrete `PredictionEngine` — keeps route handlers
 * testable and decoupled from the composition details below.
 */
export interface IPredictionEngine {
  /** Produces a full prediction bundle for one vehicle, given the full
   * live fleet it should be spatially compared against for congestion. */
  predict(vehicle: RealtimeVehicle, allVehicles: readonly RealtimeVehicle[]): VehiclePrediction;

  /** Convenience batch form: predicts every vehicle in `vehicles` against
   * that same set (each vehicle sees every other as potential neighbors). */
  predictBatch(vehicles: readonly RealtimeVehicle[]): VehiclePrediction[];
}

export class PredictionEngine implements IPredictionEngine {
  constructor(
    private readonly congestionService: ICongestionService = new CongestionService(),
    private readonly etaService: IEtaService = new EtaService(),
    private readonly delayService: IDelayService = new DelayService(),
  ) {}

  predict(vehicle: RealtimeVehicle, allVehicles: readonly RealtimeVehicle[]): VehiclePrediction {
    // 1) Congestion first — a genuine measurement from real positions,
    //    with no dependency on the other two domains.
    const congestion = this.congestionService.assess(vehicle, allVehicles);
    return this.assemble(vehicle, congestion);
  }

  predictBatch(vehicles: readonly RealtimeVehicle[]): VehiclePrediction[] {
    // Milestone 8 fix: batch congestion once via the spatial-grid path
    // (O(n) average case) instead of calling assess() once per vehicle
    // (which made this O(n²) — ~2.8s for the real 5,356-vehicle feed,
    // the root cause of the "20+ second" analytics responses). Results
    // are identical to the old per-vehicle-assess() loop, just computed
    // far more cheaply — see congestion.service.ts's module doc.
    const congestionByVehicle = this.congestionService.assessBatch(vehicles);

    return vehicles.map((vehicle) => {
      const congestion = congestionByVehicle.get(vehicle.entityId) ?? this.congestionService.assess(vehicle, vehicles);
      return this.assemble(vehicle, congestion);
    });
  }

  /** Shared by predict() and predictBatch() so ETA/Delay composition and
   * result assembly exist exactly once. */
  private assemble(vehicle: RealtimeVehicle, congestion: VehiclePrediction["congestion"]): VehiclePrediction {
    // 2) ETA next — its congestion-adjusted speed depends on congestion.
    const eta = this.etaService.estimate(vehicle, congestion);

    // 3) Delay last — its confidence is derived from ETA's.
    const delay = this.delayService.estimate(vehicle, eta);

    return {
      vehicleId: vehicle.entityId,
      tripId: vehicle.trip.tripId,
      routeId: vehicle.trip.routeId,
      eta,
      delay,
      congestion,
      overallConfidence: this.blendConfidence(eta.confidence, delay.confidence),
      methodology: METHODOLOGY,
      generatedAtMs: Date.now(),
    };
  }

  /** Congestion is a direct measurement (treated as fully certain, weight
   * 1.0) blended with the two seeded-placeholder domains. */
  private blendConfidence(etaConfidence: number, delayConfidence: number): number {
    const congestionCertainty = 1;
    return roundTo(clamp((etaConfidence + delayConfidence + congestionCertainty) / 3, 0, 1), 2);
  }
}

/**
 * Module-level singleton factory. A full DI container would be
 * over-engineering at this scale (three stateless services); this keeps
 * route handlers simple while still going through the `IPredictionEngine`
 * seam rather than `new PredictionEngine()` scattered across routes.
 */
let sharedEngine: IPredictionEngine | null = null;

export function getPredictionEngine(): IPredictionEngine {
  if (!sharedEngine) {
    sharedEngine = new PredictionEngine();
  }
  return sharedEngine;
}

/**
 * Milestone 8 fix: caches the last computed batch, keyed to the exact
 * moment of Realtime Engine data it was computed from
 * (`RealtimeSnapshot.fetchedAtMs`, which — thanks to
 * `realtime.service.ts`'s own 5s cache — only actually changes every 5s
 * regardless of how many HTTP requests arrive). Every consumer that
 * passes the same snapshot (every `/api/prediction/*` and
 * `/api/analytics/*` route, all in the same request cycle) gets the same
 * array without recomputation — "Prediction Engine executes only once"
 * per real data refresh, not once per HTTP request.
 */
let cachedBatch: { fetchedAtMs: number; predictions: VehiclePrediction[] } | null = null;

export function getCachedPredictionBatch(snapshot: {
  vehicles: readonly RealtimeVehicle[];
  fetchedAtMs: number;
}): VehiclePrediction[] {
  if (cachedBatch && cachedBatch.fetchedAtMs === snapshot.fetchedAtMs) {
    return cachedBatch.predictions;
  }
  const predictions = getPredictionEngine().predictBatch(snapshot.vehicles);
  cachedBatch = { fetchedAtMs: snapshot.fetchedAtMs, predictions };
  return predictions;
}
