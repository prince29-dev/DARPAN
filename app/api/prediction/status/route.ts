/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Route: GET /api/prediction/status
 * ============================================================================
 *
 * A lightweight health/capability check for the Prediction Engine —
 * reports whether it can currently reach live vehicles (via the
 * untouched Realtime Engine), how many are available, and which
 * methodology is active. Runs no predictions itself.
 */

import { NextResponse } from "next/server";

import { handlePredictionError, NO_STORE_HEADERS } from "@/app/api/prediction/_shared";
import { getVehiclePositionsSnapshot } from "@/services/realtime/realtime.service";
import type { PredictionEngineStatus } from "@/types/prediction";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ENDPOINTS = [
  "/api/prediction/eta",
  "/api/prediction/delay",
  "/api/prediction/congestion",
  "/api/prediction/status",
];

export async function GET(): Promise<NextResponse> {
  try {
    const snapshot = await getVehiclePositionsSnapshot();

    const body: PredictionEngineStatus = {
      status: "operational",
      methodology: "deterministic-heuristic-v1",
      isMachineLearning: false,
      isMock: true,
      availableVehicles: snapshot.vehicles.length,
      lastRealtimeUpdateMs: snapshot.fetchedAtMs,
      endpoints: ENDPOINTS,
      generatedAtMs: Date.now(),
    };

    return NextResponse.json(body, { headers: NO_STORE_HEADERS });
  } catch (error) {
    // The Prediction Engine itself is fine — it's the upstream Realtime
    // Engine it depends on that's unavailable. Report that distinction
    // rather than a generic 500.
    return handlePredictionError(error);
  }
}
