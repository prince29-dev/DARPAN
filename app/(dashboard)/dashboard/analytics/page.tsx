import { Sparkles } from "lucide-react";

import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { AnalyticsPredictionSummary } from "@/components/dashboard/analytics-prediction-summary";
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ANALYTICS_CHARTS, ANALYTICS_KPIS } from "@/constants/analytics";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Digital Twin Operations Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Live network health, AI insights, and route-level analytics — computed deterministically
          from the Realtime and Prediction Engines (Milestone 8).
        </p>
      </div>

      <AnalyticsOverview />

      <div>
        <h2 className="mb-1 font-display text-base font-semibold tracking-tight text-muted-foreground">
          Legacy placeholders
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Kept for compatibility with earlier milestones — superseded by the live Operations
          Center above.
        </p>

        <div className="flex flex-col gap-8">
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold tracking-tight">Network KPIs</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {ANALYTICS_KPIS.map((kpi) => (
                <StatCard key={kpi.label} {...kpi} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold tracking-tight">
              Prediction Summary (client-aggregated)
            </h3>
            <AnalyticsPredictionSummary />
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold tracking-tight">Trends (static)</h3>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {ANALYTICS_CHARTS.map((chart) => (
                <ChartPlaceholder key={chart.title} {...chart} />
              ))}
            </div>
          </div>

          <Card glass>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex size-10 items-center justify-center rounded-md border border-border bg-surface-elevated">
                <Sparkles className="size-5 text-accent" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <CardTitle>Trained-model AI widgets</CardTitle>
                <CardDescription>
                  Anomaly detection and forecast overlays from trained ML models will appear here
                  once the AI Engine is connected — distinct from the deterministic AI Insights
                  above, which are already live.
                </CardDescription>
              </div>
              <Badge variant="outline">Coming soon</Badge>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
