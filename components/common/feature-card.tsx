import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export function FeatureCard({ title, description, icon: Icon, badge }: FeatureCardProps) {
  return (
    <Card glass className="group transition-colors hover:border-accent/30">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-md border border-border bg-surface-elevated transition-colors group-hover:border-accent/40">
            <Icon className="size-5 text-accent" strokeWidth={1.75} />
          </div>
          {badge && <Badge variant="outline">{badge}</Badge>}
        </div>
        <div className="flex flex-col gap-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
