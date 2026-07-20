import { Brain, Clock, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PredictionModule {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PREDICTION_MODULES: PredictionModule[] = [
  {
    title: "ETA Prediction",
    description:
      "Forecasts arrival times at downstream stations using live positions and historical patterns.",
    icon: Clock,
  },
  {
    title: "Delay Detection",
    description: "Flags trips deviating from schedule and estimates propagation across the line.",
    icon: TrendingUp,
  },
  {
    title: "Crowding Prediction",
    description: "Estimates platform and coach occupancy ahead of arrival.",
    icon: Users,
  },
  {
    title: "Passenger Flow",
    description: "Models origin-destination demand across the network over time.",
    icon: Brain,
  },
];
