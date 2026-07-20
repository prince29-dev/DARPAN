import { Sparkles } from "lucide-react";

import { PredictionCard } from "@/components/dashboard/prediction-card";
import { PredictionStatusCard } from "@/components/dashboard/prediction-status-card";
import { Badge } from "@/components/ui/badge";
import { PREDICTION_MODULES } from "@/constants/ai-predictions";

export const metadata = { title: "AI Lab" };

export default function AiLabPage() {
  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">AI Lab</h1>
          <p className="text-sm text-muted-foreground">
            Predictive modules for the metro network — design-ready, awaiting trained models.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="size-3.5" />
          AI Engine offline
        </Badge>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Prediction Engine
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          The deterministic Prediction Engine (Milestone 7) is a separate, already-live system
          from the trained-model modules below — it runs real ETA/delay/congestion heuristics
          against the live vehicle feed today, without machine learning.
        </p>
        <PredictionStatusCard />
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Machine-learning modules
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PREDICTION_MODULES.map((module) => (
            <PredictionCard key={module.title} {...module} />
          ))}
        </div>
      </div>
    </div>
  );
}
