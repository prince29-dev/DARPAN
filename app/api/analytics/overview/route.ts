import { NextResponse } from "next/server";

import { handleAnalyticsError, NO_STORE_HEADERS } from "@/app/api/analytics/_shared";
import { getAnalyticsOverview } from "@/services/analytics/analytics.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const overview = await getAnalyticsOverview();
    return NextResponse.json(overview, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return handleAnalyticsError(error);
  }
}
