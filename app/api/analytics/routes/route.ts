import { NextResponse } from "next/server";

import { handleAnalyticsError, NO_STORE_HEADERS } from "@/app/api/analytics/_shared";
import { getRouteAnalyticsList } from "@/services/analytics/analytics.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const routes = await getRouteAnalyticsList();
    return NextResponse.json({ count: routes.length, results: routes }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return handleAnalyticsError(error);
  }
}
