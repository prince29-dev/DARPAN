import { INTERNAL_VEHICLES_API_PATH, REALTIME_CONFIG } from "@/config/realtime";
import type { RealtimeError, RealtimeSnapshot } from "@/types/realtime";

export type VehicleFeedResult =
  | { ok: true; snapshot: RealtimeSnapshot; clientLatencyMs: number }
  | { ok: false; error: RealtimeError };

function isRealtimeError(value: unknown): value is RealtimeError {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "message" in value &&
    typeof (value as RealtimeError).kind === "string"
  );
}

/**
 * Fetches one snapshot from our internal `/api/realtime/vehicles` proxy.
 * AbortController-backed timeout; the polling engine owns retry/backoff
 * across calls, so this function makes exactly one attempt per call.
 */
export async function fetchVehiclePositions(signal?: AbortSignal): Promise<VehicleFeedResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REALTIME_CONFIG.clientRequestTimeoutMs);

  // Let an external abort (e.g. component unmount) cancel this request too.
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);

  const startedAt = performance.now();

  try {
    const response = await fetch(INTERNAL_VEHICLES_API_PATH, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const clientLatencyMs = Math.round(performance.now() - startedAt);
    const body: unknown = await response.json();

    if (!response.ok) {
      const error: RealtimeError =
        body && typeof body === "object" && "error" in body && isRealtimeError((body as { error: unknown }).error)
          ? (body as { error: RealtimeError }).error
          : { kind: "unknown", message: `Request failed with status ${response.status}`, httpStatus: response.status };
      return { ok: false, error };
    }

    return { ok: true, snapshot: body as RealtimeSnapshot, clientLatencyMs };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        error: { kind: "timeout", message: "Realtime request timed out.", httpStatus: null },
      };
    }
    const message = error instanceof Error ? error.message : "Unknown network error";
    return { ok: false, error: { kind: "network", message, httpStatus: null } };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}
