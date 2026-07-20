/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Route: GET /api/prediction/eta
 * ============================================================================
 *
 * Reads live vehicles from the existing, untouched Realtime Engine
 * (`getVehiclePositionsSnapshot` — Milestone 6) and returns deterministic
 * ETA estimates for them via `PredictionEngine`. This route contains no
 * prediction logic itself — it only fetches, delegates, and shapes the
 * HTTP response, per Single Responsibility.
 *
 * Milestone 8 fix: uses `getCachedPredictionBatch()` so the full-fleet
 * prediction batch is computed once per Realtime Engine refresh and
 * shared with `/delay`, `/congestion`, and every `/api/analytics/*`
 * route — not recomputed per request. Both the list and single-vehicle
 * paths below derive from that one cached array.
 *
 * Query params:
 *   ?vehicleId=<id>  Single-vehicle lookup. 404 if that vehicle isn't in
 *                     the current live snapshot.
 *   ?limit=<n>        Caps the batch list (default 100, max 1000) when
 *                     `vehicleId` isn't given.
 */

import { NextResponse } from "next/server";

import {
  buildDisclaimer,
  handlePredictionError,
  NO_STORE_HEADERS,
  parseLimit,
} from "@/app/api/prediction/_shared";
import { getCachedPredictionBatch } from "@/services/prediction/prediction.service";
import { getVehiclePositionsSnapshot } from "@/services/realtime/realtime.service";
import type { EtaEstimate } from "@/types/eta";
import type { PredictionListResponse, PredictionSingleResponse } from "@/types/prediction";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    const snapshot = await getVehiclePositionsSnapshot();
    const predictions = getCachedPredictionBatch(snapshot);

    if (vehicleId) {
      const prediction = predictions.find((p) => p.vehicleId === vehicleId);
      if (!prediction) {
        return NextResponse.json(
          { error: { kind: "not-found", message: `No live vehicle with id "${vehicleId}".`, httpStatus: 404 } },
          { status: 404, headers: NO_STORE_HEADERS },
        );
      }

      const body: PredictionSingleResponse<EtaEstimate> = {
        disclaimer: buildDisclaimer(),
        generatedAtMs: Date.now(),
        result: prediction.eta,
      };
      return NextResponse.json(body, { headers: NO_STORE_HEADERS });
    }

    const limit = parseLimit(searchParams);
    const page = predictions.slice(0, limit);

    const body: PredictionListResponse<EtaEstimate> = {
      disclaimer: buildDisclaimer(),
      count: page.length,
      totalAvailable: predictions.length,
      generatedAtMs: Date.now(),
      results: page.map((p) => p.eta),
    };
    return NextResponse.json(body, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return handlePredictionError(error);
  }
}
