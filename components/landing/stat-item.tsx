"use client";

import { useCountUp } from "@/hooks/use-count-up";
import { formatIndianNumber } from "@/lib/utils";
import type { NetworkStat } from "@/constants/stats";

export function StatItem({ stat }: { stat: NetworkStat }) {
  const { ref, value } = useCountUp(stat.value);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-6 text-center"
    >
      <span className="font-display text-4xl font-semibold tabular-nums tracking-tight">
        {formatIndianNumber(value)}
      </span>
      <span className="text-sm text-muted-foreground">{stat.label}</span>
    </div>
  );
}
