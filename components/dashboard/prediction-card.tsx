import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionModule } from "@/constants/ai-predictions";

export function PredictionCard({ title, description, icon: Icon }: PredictionModule) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-md border border-border bg-surface-elevated">
            <Icon className="size-5 text-accent" strokeWidth={1.75} />
          </div>
          <Badge variant="outline">Model not trained</Badge>
        </div>
        <div className="flex flex-col gap-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
