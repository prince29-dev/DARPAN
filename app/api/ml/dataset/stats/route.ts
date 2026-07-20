/**
 * ============================================================================
 * DARPAN — Milestone 9.1: Dataset Generation Pipeline
 * Route: GET /api/ml/dataset/stats
 * ============================================================================
 *
 * Reports on the real dataset.csv file on disk — row count, last write
 * time, file size, and today's sample count. Reads no realtime or
 * prediction data itself; that only happens as a side effect of
 * `services/analytics/analytics.service.ts`'s `computeContext()` calling
 * `ml/exporter/dataset-export.service.ts`'s `recordSnapshot()`.
 */

import { NextResponse } from "next/server";

import { getDatasetStats } from "@/ml/exporter/dataset-export.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const stats = getDatasetStats();
    return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown dataset stats error.";
    return NextResponse.json(
      { error: { message } },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
