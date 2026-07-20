"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { colors } from "@/constants/theme";
import type { TrendMetric, TrendPoint, TrendSeries } from "@/types/analytics";

interface ChartDef {
  metric: TrendMetric;
  title: string;
  color: string;
  formatValue: (value: number) => string;
}

const CHART_DEFS: ChartDef[] = [
  { metric: "vehicleCount", title: "Vehicle Trend", color: colors.accent, formatValue: (v) => `${Math.round(v)}` },
  {
    metric: "averageEtaSeconds",
    title: "Average ETA",
    color: colors.accent,
    formatValue: (v) => `${Math.round(v / 60)}m`,
  },
  {
    metric: "averageDelaySeconds",
    title: "Average Delay",
    color: colors.signal,
    formatValue: (v) => `${Math.round(v / 60)}m`,
  },
  {
    metric: "congestionIndex",
    title: "Congestion Trend",
    color: colors.destructive,
    formatValue: (v) => `${Math.round(v * 100)}`,
  },
  {
    metric: "predictionConfidence",
    title: "Prediction Confidence",
    color: colors.accent,
    formatValue: (v) => `${Math.round(v * 100)}%`,
  },
  {
    metric: "averageSpeedKmh",
    title: "Average Speed",
    color: colors.foreground,
    formatValue: (v) => `${v.toFixed(1)} km/h`,
  },
  {
    metric: "realtimeLatencyMs",
    title: "Realtime Latency",
    color: colors.signal,
    formatValue: (v) => `${Math.round(v)}ms`,
  },
];

function toChartData(points: TrendPoint[]): { time: string; value: number | null }[] {
  return points.map((point) => ({
    time: new Date(point.timestampMs).toLocaleTimeString("en-IN", { hour12: false }),
    value: point.value,
  }));
}

function MiniTrendChart({ def, points }: { def: ChartDef; points: TrendPoint[] }) {
  const data = toChartData(points);
  const hasData = data.some((d) => d.value !== null);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-2 text-xs text-muted-foreground">{def.title}</p>
      {!hasData ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground/60">
          Collecting trend history…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={128}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: colors.mutedForeground }} minTickGap={24} />
            <YAxis
              tick={{ fontSize: 10, fill: colors.mutedForeground }}
              width={36}
              tickFormatter={(v: number) => def.formatValue(v)}
            />
            <Tooltip
              contentStyle={{
                background: colors.surfaceElevated,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: colors.mutedForeground }}
              formatter={(value) => (typeof value === "number" ? def.formatValue(value) : String(value ?? "—"))}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={def.color}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function TrendChartBody({ series }: { series: TrendSeries }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CHART_DEFS.map((def) => (
        <MiniTrendChart key={def.metric} def={def} points={series[def.metric]} />
      ))}
    </div>
  );
}
