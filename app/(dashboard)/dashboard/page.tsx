import { AIInsights } from "@/components/analytics/AIInsights";
import { CongestionHeatmap } from "@/components/analytics/CongestionHeatmap";
import { KPIGrid } from "@/components/analytics/KPIGrid";
import { NetworkHealthCard } from "@/components/analytics/NetworkHealthCard";
import { OperationsTimeline } from "@/components/analytics/OperationsTimeline";
import { RouteRankingTable } from "@/components/analytics/RouteRankingTable";
import { TrendCharts } from "@/components/analytics/TrendCharts";
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder";
import { HeroSection } from "@/components/dashboard/hero-section";
import { PredictionOverviewCards } from "@/components/dashboard/prediction-overview-cards";
import { PredictionStatusCard } from "@/components/dashboard/prediction-status-card";
import { RealtimeStatusCard } from "@/components/dashboard/realtime-status-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildOverviewStats, OVERVIEW_CHARTS } from "@/constants/dashboard-overview";
import { getGtfsStatistics } from "@/services/gtfs/statistics";

export const metadata = {
  title: "Overview",
};

export default function DashboardPage() {
  const stats = getGtfsStatistics();
  const overviewStats = buildOverviewStats(stats);

  return (
    <div className="flex flex-col">
      <HeroSection />

      <div className="flex flex-col gap-8 px-6 py-8 sm:px-8">
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
            Network at a glance
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        <RealtimeStatusCard />

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
            Prediction Engine
          </h2>
          <div className="flex flex-col gap-4">
            <PredictionStatusCard />
            <PredictionOverviewCards />
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
            Digital Twin Operations
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
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

            <KPIGrid />

            <TrendCharts />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
            Analytics
          </h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {OVERVIEW_CHARTS.map((chart) => (
              <ChartPlaceholder key={chart.title} {...chart} />
            ))}
          </div>
        </div>

        <RecentActivity />
      </div>
    </div>
  );
}
