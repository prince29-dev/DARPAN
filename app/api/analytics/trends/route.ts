import { NextResponse } from "next/server";

import { handleAnalyticsError, NO_STORE_HEADERS } from "@/app/api/analytics/_shared";
import { getTrends } from "@/services/analytics/analytics.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const trends = await getTrends();
    return NextResponse.json(trends, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return handleAnalyticsError(error);
  }
}
