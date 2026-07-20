/**
 * Milestone 6 configuration. Values here are the *defaults*; the polling
 * interval is also runtime-configurable through the Zustand store (see
 * `stores/realtime-store.ts`) since the brief asks for a configurable
 * interval, not just a fixed one.
 */

/** otd.delhi.gov.in's documented real-time endpoint shape is
 * `/api/realtime/VehiclePositions.pb?key=YOUR_PRIVATE_KEY` — see
 * https://otd.delhi.gov.in/documentation/. The base URL is overridable via
 * env for staging/testing without touching code. */
export const DEFAULT_OTD_VEHICLE_POSITIONS_URL =
  "https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb";

export const REALTIME_CONFIG = {
  /** Default client polling cadence. Configurable at runtime via the store. */
  defaultPollIntervalMs: 15_000,
  minPollIntervalMs: 5_000,
  maxPollIntervalMs: 120_000,

  /** Upstream OTD fetch (server-side leg). */
  otdRequestTimeoutMs: 10_000,
  otdMaxRetries: 2,
  otdRetryBaseDelayMs: 500,

  /** Browser → our own `/api/realtime/vehicles` leg. */
  clientRequestTimeoutMs: 8_000,

  /** Exponential backoff for the polling engine after a failed cycle. */
  backoffBaseMs: 2_000,
  backoffFactor: 2,
  backoffMaxMs: 60_000,
  backoffMaxAttempts: 8,
} as const;

export const INTERNAL_VEHICLES_API_PATH = "/api/realtime/vehicles";
