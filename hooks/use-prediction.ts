"use client";

/**
 * Reusable hooks over the Prediction API client (`lib/prediction-api.ts`).
 * The shared fetch/loading/error/retry/auto-refresh implementation lives
 * in `hooks/use-async-resource.ts` (also used by `hooks/use-analytics.ts`)
 * so it exists exactly once across the codebase.
 *
 * None of these poll as aggressively as the Realtime Engine (15s) — the
 * Prediction Engine recomputes from whatever the Realtime Engine currently
 * has, so refreshing faster than that would just repeat work. Default
 * refresh is 20s; pass `intervalMs: null` to fetch once and never refresh.
 */

import * as React from "react";

import {
  fetchCongestionForVehicle,
  fetchCongestionList,
  fetchDelayForVehicle,
  fetchDelayList,
  fetchEtaForVehicle,
  fetchEtaList,
  fetchPredictionStatus,
  type PredictionApiResult,
  type PredictionListParams,
} from "@/lib/prediction-api";
import {
  useAsyncResource,
  type UseAsyncResourceOptions,
  type UseAsyncResourceResult,
} from "@/hooks/use-async-resource";
import type { CongestionAssessment, CongestionLevel } from "@/types/congestion";
import type { DelayEstimate } from "@/types/delay";
import type { EtaEstimate } from "@/types/eta";
import type { PredictionEngineStatus, PredictionListResponse } from "@/types/prediction";

const AGGREGATE_SAMPLE_LIMIT = 200;

export type UsePredictionQueryResult<T> = UseAsyncResourceResult<T>;
export type UsePredictionQueryOptions = UseAsyncResourceOptions;

/** Thin alias kept for readability at each call site below. */
const usePredictionQuery = useAsyncResource;

/** GET /api/prediction/status */
export function usePredictionStatus(
  options?: UsePredictionQueryOptions,
): UsePredictionQueryResult<PredictionEngineStatus> {
  const fetcher = React.useCallback(() => fetchPredictionStatus(), []);
  return usePredictionQuery(fetcher, options);
}

/** GET /api/prediction/eta — batch (default) or single vehicle via `vehicleId`. */
export function usePredictionETA(
  params?: PredictionListParams & { vehicleId?: string },
  options?: UsePredictionQueryOptions,
): UsePredictionQueryResult<EtaEstimate[]> {
  const vehicleId = params?.vehicleId;
  const limit = params?.limit;

  const fetcher = React.useCallback(async () => {
    if (vehicleId) {
      const result = await fetchEtaForVehicle(vehicleId);
      return result.ok ? { ok: true as const, data: [result.data.result] } : result;
    }
    const result = await fetchEtaList({ limit });
    return result.ok ? { ok: true as const, data: result.data.results } : result;
  }, [vehicleId, limit]);

  return usePredictionQuery(fetcher, options);
}

/** GET /api/prediction/delay — batch (default) or single vehicle via `vehicleId`. */
export function usePredictionDelay(
  params?: PredictionListParams & { vehicleId?: string },
  options?: UsePredictionQueryOptions,
): UsePredictionQueryResult<DelayEstimate[]> {
  const vehicleId = params?.vehicleId;
  const limit = params?.limit;

  const fetcher = React.useCallback(async () => {
    if (vehicleId) {
      const result = await fetchDelayForVehicle(vehicleId);
      return result.ok ? { ok: true as const, data: [result.data.result] } : result;
    }
    const result = await fetchDelayList({ limit });
    return result.ok ? { ok: true as const, data: result.data.results } : result;
  }, [vehicleId, limit]);

  return usePredictionQuery(fetcher, options);
}

/** GET /api/prediction/congestion — batch (default) or single vehicle via `vehicleId`. */
export function usePredictionCongestion(
  params?: PredictionListParams & { vehicleId?: string },
  options?: UsePredictionQueryOptions,
): UsePredictionQueryResult<CongestionAssessment[]> {
  const vehicleId = params?.vehicleId;
  const limit = params?.limit;

  const fetcher = React.useCallback(async () => {
    if (vehicleId) {
      const result = await fetchCongestionForVehicle(vehicleId);
      return result.ok ? { ok: true as const, data: [result.data.result] } : result;
    }
    const result = await fetchCongestionList({ limit });
    return result.ok ? { ok: true as const, data: result.data.results } : result;
  }, [vehicleId, limit]);

  return usePredictionQuery(fetcher, options);
}

// ---------------------------------------------------------------------------
// Aggregate hook — powers every "network-wide" prediction summary in the UI
// (Overview mini cards, Realtime Engine card's Prediction Confidence,
// Analytics summary, Network congestion panel, Stations/Routes banners) so
// none of them duplicate this Promise.all + averaging logic.
// ---------------------------------------------------------------------------

export interface PredictionAggregate {
  vehiclesAnalyzed: number;
  averageEtaSeconds: number | null;
  averageDelaySeconds: number | null;
  /** How many of `vehiclesAnalyzed` had a non-null delay (i.e. a SCHEDULED trip). */
  delaySampleCount: number;
  averageConfidence: number;
  congestionCounts: Record<CongestionLevel, number>;
  /** Mean congestion density score across the sample, in [0, 1]. */
  congestionIndex: number;
  dominantCongestionLevel: CongestionLevel;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function emptyCongestionCounts(): Record<CongestionLevel, number> {
  return { low: 0, moderate: 0, high: 0, severe: 0 };
}

function buildAggregate(
  eta: PredictionListResponse<EtaEstimate>,
  delay: PredictionListResponse<DelayEstimate>,
  congestion: PredictionListResponse<CongestionAssessment>,
): PredictionAggregate {
  const etaSeconds = eta.results.map((e) => e.etaSeconds);
  const delaySeconds = delay.results
    .map((d) => d.predictedDelaySeconds)
    .filter((s): s is number => s !== null);

  const confidences = [
    ...eta.results.map((e) => e.confidence),
    ...delay.results.filter((d) => d.predictedDelaySeconds !== null).map((d) => d.confidence),
  ];

  const congestionCounts = emptyCongestionCounts();
  for (const c of congestion.results) congestionCounts[c.level] += 1;

  const densityScores = congestion.results.map((c) => c.densityScore);

  let dominantCongestionLevel: CongestionLevel = "low";
  let dominantCount = -1;
  for (const level of Object.keys(congestionCounts) as CongestionLevel[]) {
    if (congestionCounts[level] > dominantCount) {
      dominantCount = congestionCounts[level];
      dominantCongestionLevel = level;
    }
  }

  return {
    vehiclesAnalyzed: eta.results.length,
    averageEtaSeconds: average(etaSeconds),
    averageDelaySeconds: average(delaySeconds),
    delaySampleCount: delaySeconds.length,
    averageConfidence: average(confidences) ?? 0,
    congestionCounts,
    congestionIndex: average(densityScores) ?? 0,
    dominantCongestionLevel,
  };
}

/**
 * Fetches ETA, Delay, and Congestion batches in parallel (`Promise.all`,
 * per the performance requirement — none of these three requests block
 * the others) and reduces them into one summary object.
 */
export function usePredictionAggregate(
  params?: PredictionListParams,
  options?: UsePredictionQueryOptions,
): UsePredictionQueryResult<PredictionAggregate> {
  const limit = params?.limit ?? AGGREGATE_SAMPLE_LIMIT;

  const fetcher = React.useCallback(async (): Promise<PredictionApiResult<PredictionAggregate>> => {
    const [etaResult, delayResult, congestionResult] = await Promise.all([
      fetchEtaList({ limit }),
      fetchDelayList({ limit }),
      fetchCongestionList({ limit }),
    ]);

    if (!etaResult.ok) return etaResult;
    if (!delayResult.ok) return delayResult;
    if (!congestionResult.ok) return congestionResult;

    return {
      ok: true,
      data: buildAggregate(etaResult.data, delayResult.data, congestionResult.data),
    };
  }, [limit]);

  return usePredictionQuery(fetcher, options);
}
