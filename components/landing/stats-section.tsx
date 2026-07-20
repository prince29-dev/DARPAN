import { StatItem } from "@/components/landing/stat-item";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import type { NetworkStat } from "@/constants/stats";

export function StatsSection({ stats }: { stats: NetworkStat[] }) {
  return (
    <Section
      eyebrow="Network scale"
      title="Delhi Metro, modeled end to end"
      description="Every station, route, and trip in the network — parsed live from the official DMRC GTFS feed."
      className="border-b border-border py-16 sm:py-20"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Badge variant="outline">Powered by GTFS</Badge>
      </div>
    </Section>
  );
}
