"use client";

import { AIInsights } from "@/components/analytics/AIInsights";
import { CongestionHeatmap } from "@/components/analytics/CongestionHeatmap";
import { KPIGrid } from "@/components/analytics/KPIGrid";
import { NetworkHealthCard } from "@/components/analytics/NetworkHealthCard";
import { OperationsTimeline } from "@/components/analytics/OperationsTimeline";
import { PredictionAnalyticsSummary } from "@/components/analytics/PredictionAnalyticsSummary";
import { RouteRankingTable } from "@/components/analytics/RouteRankingTable";
import { TrendCharts } from "@/components/analytics/TrendCharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The full Digital Twin Operations Center layout — every Analytics
 * Engine panel, composed in one place so both the Analytics page and
 * (a subset via direct imports) the Overview page can render a
 * consistent experience without duplicating layout logic.
 */
export function AnalyticsOverview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <NetworkHealthCard />
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Rule-based, deterministic operational intelligence.</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <AIInsights />
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Key Performance Indicators
        </h2>
        <KPIGrid />
      </div>

      <PredictionAnalyticsSummary />

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Trends</h2>
        <TrendCharts />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Congestion Heatmap</CardTitle>
            <CardDescription>Per-route congestion, from the live vehicle feed.</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <CongestionHeatmap />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operations Timeline</CardTitle>
            <CardDescription>Live event log.</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <OperationsTimeline />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Rankings</CardTitle>
          <CardDescription>Busiest live routes, with operational health.</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <RouteRankingTable />
        </div>
      </Card>
    </div>
  );
}
