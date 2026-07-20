import "server-only";

import { DEFAULT_OTD_VEHICLE_POSITIONS_URL, REALTIME_CONFIG } from "@/config/realtime";
import type { RealtimeError, RealtimeErrorKind } from "@/types/realtime";

export class OtdFeedError extends Error {
  readonly kind: RealtimeErrorKind;
  readonly httpStatus: number | null;

  constructor(kind: RealtimeErrorKind, message: string, httpStatus: number | null = null) {
    super(message);
    this.name = "OtdFeedError";
    this.kind = kind;
    this.httpStatus = httpStatus;
  }

  toRealtimeError(): RealtimeError {
    return { kind: this.kind, message: this.message, httpStatus: this.httpStatus };
  }
}

function classifyHttpStatus(status: number): RealtimeErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  if (status >= 500) return "server-error";
  return "unknown";
}

function resolveUrl(): string {
  const base =
    process.env.OTD_VEHICLE_POSITIONS_URL?.trim() || DEFAULT_OTD_VEHICLE_POSITIONS_URL;
  const apiKey = process.env.OTD_API_KEY?.trim();

  if (!apiKey) {
    throw new OtdFeedError(
      "unauthorized",
      "OTD_API_KEY is not set. Add it to .env (see .env.example) to enable the realtime feed.",
    );
  }

  const url = new URL(base);
  url.searchParams.set("key", apiKey);
  return url.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RawVehiclePositionsFeed {
  bytes: Uint8Array;
  responseSizeBytes: number;
  latencyMs: number;
}

/**
 * Fetches the raw VehiclePositions protobuf bytes from OTD, with a request
 * timeout (AbortController), retry with linear backoff for transient
 * network/5xx failures, and explicit classification of 401/403/404/429/5xx.
 * Never retries 401/403/404 — those won't resolve by retrying.
 */
export async function fetchVehiclePositionsPb(): Promise<RawVehiclePositionsFeed> {
  const url = resolveUrl();
  const { otdRequestTimeoutMs, otdMaxRetries, otdRetryBaseDelayMs } = REALTIME_CONFIG;

  let lastError: OtdFeedError | null = null;

  for (let attempt = 0; attempt <= otdMaxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), otdRequestTimeoutMs);
    const startedAt = Date.now();

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/x-protobuf, application/octet-stream" },
        cache: "no-store",
      });
      const latencyMs = Date.now() - startedAt;

      if (!response.ok) {
        const kind = classifyHttpStatus(response.status);
        lastError = new OtdFeedError(
          kind,
          `OTD responded ${response.status} ${response.statusText}`,
          response.status,
        );
        // 401/403/404 are not transient — fail fast instead of retrying.
        if (kind === "unauthorized" || kind === "forbidden" || kind === "not-found") {
          throw lastError;
        }
        // 429/5xx may be transient — fall through to retry below.
      } else {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength === 0) {
          throw new OtdFeedError("empty-feed", "OTD returned an empty response body.");
        }
        return {
          bytes: new Uint8Array(buffer),
          responseSizeBytes: buffer.byteLength,
          latencyMs,
        };
      }
    } catch (error) {
      if (error instanceof OtdFeedError) {
        if (error.kind === "unauthorized" || error.kind === "forbidden" || error.kind === "not-found") {
          throw error;
        }
        lastError = error;
      } else if (error instanceof Error && error.name === "AbortError") {
        lastError = new OtdFeedError("timeout", `OTD request timed out after ${otdRequestTimeoutMs}ms`);
      } else {
        const message = error instanceof Error ? error.message : "Unknown network error";
        lastError = new OtdFeedError("network", message);
      }
    } finally {
      clearTimeout(timer);
    }

    if (attempt < otdMaxRetries) {
      await sleep(otdRetryBaseDelayMs * (attempt + 1));
    }
  }

  throw lastError ?? new OtdFeedError("unknown", "OTD fetch failed for an unknown reason.");
}
