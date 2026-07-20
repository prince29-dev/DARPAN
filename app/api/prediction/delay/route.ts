/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Route: GET /api/prediction/delay
 * ============================================================================
 *
 * Same shape and contract as `../eta/route.ts` — see that file's header
 * for the full explanation, including the Milestone 8 cached-batch fix.
 * This route returns `DelayEstimate` instead of `EtaEstimate`; note that
 * `predictedDelaySeconds` is `null` for any vehicle whose trip has no
 * schedule reference (see `types/delay.ts`).
 *
 * Query params:
 *   ?vehicleId=<id>  Single-vehicle lookup. 404 if not currently live.
 *   ?limit=<n>        Caps the batch list (default 100, max 1000).
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
import type { DelayEstimate } from "@/types/delay";
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

      const body: PredictionSingleResponse<DelayEstimate> = {
        disclaimer: buildDisclaimer(),
        generatedAtMs: Date.now(),
        result: prediction.delay,
      };
      return NextResponse.json(body, { headers: NO_STORE_HEADERS });
    }

    const limit = parseLimit(searchParams);
    const page = predictions.slice(0, limit);

    const body: PredictionListResponse<DelayEstimate> = {
      disclaimer: buildDisclaimer(),
      count: page.length,
      totalAvailable: predictions.length,
      generatedAtMs: Date.now(),
      results: page.map((p) => p.delay),
    };
    return NextResponse.json(body, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return handlePredictionError(error);
  }
}
