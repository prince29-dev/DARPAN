/**
 * Prediction API client (Milestone 7 Phase 2 — frontend integration).
 *
 * Centralizes every fetch to the existing, untouched /api/prediction/*
 * endpoints (built in Milestone 7 Phase 1). No component should call
 * `fetch("/api/prediction/...")` directly — go through this file so
 * timeout/error handling stays in one place.
 */

import type { CongestionAssessment } from "@/types/congestion";
import type { DelayEstimate } from "@/types/delay";
import type { EtaEstimate } from "@/types/eta";
import type {
  PredictionEngineStatus,
  PredictionListResponse,
  PredictionSingleResponse,
} from "@/types/prediction";

const REQUEST_TIMEOUT_MS = 8_000;
const DEFAULT_LIST_LIMIT = 200;

export interface PredictionApiError {
  message: string;
  status: number | null;
}

export type PredictionApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PredictionApiError };

async function requestJson<T>(path: string): Promise<PredictionApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const body: unknown = await response.json();

    if (!response.ok) {
      const message =
        body && typeof body === "object" && "error" in body
          ? String((body as { error: { message?: string } }).error?.message ?? "Request failed.")
          : `Request failed with status ${response.status}.`;
      return { ok: false, error: { message, status: response.status } };
    }

    return { ok: true, data: body as T };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: { message: "Prediction request timed out.", status: null } };
    }
    const message = error instanceof Error ? error.message : "Unknown network error.";
    return { ok: false, error: { message, status: null } };
  } finally {
    clearTimeout(timer);
  }
}

export interface PredictionListParams {
  limit?: number;
}

function listQuery(params?: PredictionListParams): string {
  const limit = params?.limit ?? DEFAULT_LIST_LIMIT;
  return `?limit=${limit}`;
}

/** GET /api/prediction/status */
export function fetchPredictionStatus(): Promise<PredictionApiResult<PredictionEngineStatus>> {
  return requestJson<PredictionEngineStatus>("/api/prediction/status");
}

/** GET /api/prediction/eta (batch) */
export function fetchEtaList(
  params?: PredictionListParams,
): Promise<PredictionApiResult<PredictionListResponse<EtaEstimate>>> {
  return requestJson<PredictionListResponse<EtaEstimate>>(`/api/prediction/eta${listQuery(params)}`);
}

/** GET /api/prediction/eta?vehicleId=... (single) */
export function fetchEtaForVehicle(
  vehicleId: string,
): Promise<PredictionApiResult<PredictionSingleResponse<EtaEstimate>>> {
  return requestJson<PredictionSingleResponse<EtaEstimate>>(
    `/api/prediction/eta?vehicleId=${encodeURIComponent(vehicleId)}`,
  );
}

/** GET /api/prediction/delay (batch) */
export function fetchDelayList(
  params?: PredictionListParams,
): Promise<PredictionApiResult<PredictionListResponse<DelayEstimate>>> {
  return requestJson<PredictionListResponse<DelayEstimate>>(`/api/prediction/delay${listQuery(params)}`);
}

/** GET /api/prediction/delay?vehicleId=... (single) */
export function fetchDelayForVehicle(
  vehicleId: string,
): Promise<PredictionApiResult<PredictionSingleResponse<DelayEstimate>>> {
  return requestJson<PredictionSingleResponse<DelayEstimate>>(
    `/api/prediction/delay?vehicleId=${encodeURIComponent(vehicleId)}`,
  );
}

/** GET /api/prediction/congestion (batch) */
export function fetchCongestionList(
  params?: PredictionListParams,
): Promise<PredictionApiResult<PredictionListResponse<CongestionAssessment>>> {
  return requestJson<PredictionListResponse<CongestionAssessment>>(
    `/api/prediction/congestion${listQuery(params)}`,
  );
}

/** GET /api/prediction/congestion?vehicleId=... (single) */
export function fetchCongestionForVehicle(
  vehicleId: string,
): Promise<PredictionApiResult<PredictionSingleResponse<CongestionAssessment>>> {
  return requestJson<PredictionSingleResponse<CongestionAssessment>>(
    `/api/prediction/congestion?vehicleId=${encodeURIComponent(vehicleId)}`,
  );
}
