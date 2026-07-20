/**
 * ============================================================================
 * DARPAN — Milestone 8: AI Analytics + Digital Twin Operations Center
 * Shared helpers for app/api/analytics/* route handlers
 * ============================================================================
 *
 * Same pattern as `app/api/prediction/_shared.ts`: underscore-prefixed so
 * Next.js's router ignores it, exports helpers only. The Analytics Engine's
 * only real failure mode is its upstream Realtime Engine dependency being
 * unavailable, so this reuses the exact same `OtdFeedError` → HTTP-status
 * mapping already established there, rather than duplicating divergent
 * error-handling logic.
 */

import { NextResponse } from "next/server";

import { OtdFeedError } from "@/services/realtime/otd-feed-client";
import type { RealtimeErrorKind } from "@/types/realtime";

export const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

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

export function handleAnalyticsError(error: unknown): NextResponse {
  const realtimeError =
    error instanceof OtdFeedError
      ? error.toRealtimeError()
      : { kind: "unknown" as const, message: "Unexpected analytics service error.", httpStatus: null };

  return NextResponse.json(
    { error: realtimeError },
    { status: HTTP_STATUS_BY_KIND[realtimeError.kind], headers: NO_STORE_HEADERS },
  );
}
