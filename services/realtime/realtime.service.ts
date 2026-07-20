import "server-only";

import { fetchVehiclePositionsPb, OtdFeedError } from "@/services/realtime/otd-feed-client";
import { decodeVehiclePositions } from "@/services/realtime/decoder";
import { normalizeFeed } from "@/services/realtime/normalize";
import type { RealtimeSnapshot } from "@/types/realtime";

/** Dedupe bursts of near-simultaneous requests from multiple browser tabs/users
 * within a single server process — OTD itself only refreshes every ~10s. */
const CACHE_TTL_MS = 5_000;

let cached: { snapshot: RealtimeSnapshot; cachedAtMs: number } | null = null;
let inFlight: Promise<RealtimeSnapshot> | null = null;

async function buildSnapshot(): Promise<RealtimeSnapshot> {
  const raw = await fetchVehiclePositionsPb();
  const feed = decodeVehiclePositions(raw.bytes);
  const normalized = normalizeFeed(feed);

  return {
    header: normalized.header,
    vehicles: normalized.vehicles,
    rawEntityCount: normalized.rawEntityCount,
    responseSizeBytes: raw.responseSizeBytes,
    fetchedAtMs: Date.now(),
    upstreamLatencyMs: raw.latencyMs,
  };
}

/**
 * Fetches+decodes+normalizes the live VehiclePositions feed, reusing a
 * cached snapshot within `CACHE_TTL_MS` and coalescing concurrent callers
 * onto a single in-flight upstream request.
 */
export async function getVehiclePositionsSnapshot(): Promise<RealtimeSnapshot> {
  const now = Date.now();
  if (cached && now - cached.cachedAtMs < CACHE_TTL_MS) {
    return cached.snapshot;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = buildSnapshot()
    .then((snapshot) => {
      cached = { snapshot, cachedAtMs: Date.now() };
      return snapshot;
    })
    .finally(() => {
      inFlight = null;
    });

  try {
    return await inFlight;
  } catch (error) {
    if (error instanceof OtdFeedError) throw error;
    const message = error instanceof Error ? error.message : "Unknown realtime service error";
    throw new OtdFeedError("unknown", message);
  }
}
