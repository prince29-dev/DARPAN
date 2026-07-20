/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Shared helpers for app/api/prediction/* route handlers
 * ============================================================================
 *
 * Small, route-agnostic helpers so `eta/route.ts`, `delay/route.ts`,
 * `congestion/route.ts`, and `status/route.ts` don't each duplicate the
 * same disclaimer object, pagination parsing, and error-to-HTTP-status
 * mapping. This file is prefixed with `_` so Next.js's App Router does
 * not treat it as a route segment — it exports helpers only, no
 * `GET`/`POST` handlers.
 *
 * Deliberately does not import from `services/realtime/*` beyond the
 * public `OtdFeedError` class it already exports (Milestone 6,
 * untouched) — this file only maps that existing error shape to a
 * response, it does not change how errors are produced.
 */

import { NextResponse } from "next/server";

import { OtdFeedError } from "@/services/realtime/otd-feed-client";
import type { PredictionDisclaimer, PredictionMethodology } from "@/types/prediction";
import type { RealtimeErrorKind } from "@/types/realtime";

const METHODOLOGY: PredictionMethodology = "deterministic-heuristic-v1";

/** Attached to every Prediction API response — see `types/prediction.ts`. */
export function buildDisclaimer(): PredictionDisclaimer {
  return {
    isMachineLearning: false,
    isMock: true,
    methodology: METHODOLOGY,
    notes:
      "Milestone 7 Phase 1: deterministic, seeded placeholder architecture. " +
      "No machine learning, no randomness, no database. Congestion is a real " +
      "spatial-density measurement from live vehicle positions; ETA and delay " +
      "are reproducible placeholders pending Phase 2+.",
  };
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

/** Parses and clamps the shared `?limit=` query param used by the three
 * list endpoints (eta/delay/congestion) when no `?vehicleId=` is given. */
export function parseLimit(searchParams: URLSearchParams): number {
  const raw = Number.parseInt(searchParams.get("limit") ?? "", 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_LIMIT;
  return Math.min(raw, MAX_LIMIT);
}

const HTTP_STATUS_BY_KIND: Record<RealtimeErrorKind, number> = {
  network: 502,
  timeout: 504,
  unauthorized: 401,
  forbidden: 403,
  "not-found": 404,
  "rate-limited": 429,
  "server-error": 502,
  "invalid-protobuf": 502,
  "empty-feed": 502,
  unknown: 500,
};

/** Maps any error thrown by the (untouched) Realtime Engine into a JSON
 * error response, mirroring the mapping already used by
 * `app/api/realtime/vehicles/route.ts` — duplicated intentionally rather
 * than imported, so this file never needs to reach into Milestone 6
 * internals beyond its public `OtdFeedError` export. */
export function handlePredictionError(error: unknown): NextResponse {
  const realtimeError =
    error instanceof OtdFeedError
      ? error.toRealtimeError()
      : { kind: "unknown" as const, message: "Unexpected prediction service error.", httpStatus: null };

  return NextResponse.json(
    { error: realtimeError },
    { status: HTTP_STATUS_BY_KIND[realtimeError.kind], headers: { "Cache-Control": "no-store" } },
  );
}

/** Standard response headers for every Prediction API route. */
export const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;
