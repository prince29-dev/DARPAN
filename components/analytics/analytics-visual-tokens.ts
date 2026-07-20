import { colors } from "@/constants/theme";
import type { NetworkHealthBand } from "@/types/analytics";
import type { CongestionLevel } from "@/types/congestion";

export type BadgeVariant = "accent" | "signal" | "destructive" | "outline";

export const HEALTH_BAND_BADGE_VARIANT: Record<NetworkHealthBand, BadgeVariant> = {
  Excellent: "accent",
  Good: "accent",
  Fair: "outline",
  Poor: "signal",
  Critical: "destructive",
};

export const HEALTH_BAND_BAR_CLASS: Record<NetworkHealthBand, string> = {
  Excellent: "bg-accent",
  Good: "bg-accent",
  Fair: "bg-foreground",
  Poor: "bg-signal",
  Critical: "bg-destructive",
};

export const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  low: "Low",
  moderate: "Medium",
  high: "High",
  severe: "Severe",
};

export const CONGESTION_ORDER: CongestionLevel[] = ["low", "moderate", "high", "severe"];

export const CONGESTION_BADGE_VARIANT: Record<CongestionLevel, BadgeVariant> = {
  low: "accent",
  moderate: "outline",
  high: "signal",
  severe: "destructive",
};

export const CONGESTION_BAR_CLASS: Record<CongestionLevel, string> = {
  low: "bg-accent",
  moderate: "bg-foreground",
  high: "bg-signal",
  severe: "bg-destructive",
};

/** Raw hex values for Recharts (which can't consume Tailwind classes). */
export const CONGESTION_HEX: Record<CongestionLevel, string> = {
  low: colors.accent,
  moderate: colors.foreground,
  high: colors.signal,
  severe: colors.destructive,
};

export function formatSeconds(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.round(seconds / 60);
  return minutes === 0 ? "<1 min" : `${minutes} min`;
}

export function formatSignedSeconds(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.round(seconds / 60);
  const sign = minutes > 0 ? "+" : "";
  return `${sign}${minutes} min`;
}
