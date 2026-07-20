import { NextResponse } from "next/server";

import { OtdFeedError } from "@/services/realtime/otd-feed-client";
import { getVehiclePositionsSnapshot } from "@/services/realtime/realtime.service";
import type { RealtimeErrorKind } from "@/types/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET() {
  try {
    const snapshot = await getVehiclePositionsSnapshot();
    return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const realtimeError =
      error instanceof OtdFeedError
        ? error.toRealtimeError()
        : { kind: "unknown" as const, message: "Unexpected realtime service error.", httpStatus: null };

    return NextResponse.json(
      { error: realtimeError },
      { status: HTTP_STATUS_BY_KIND[realtimeError.kind], headers: { "Cache-Control": "no-store" } },
    );
  }
}
