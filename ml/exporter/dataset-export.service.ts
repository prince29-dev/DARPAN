import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 9.1: Dataset Generation Pipeline
 * Service: Dataset Export
 * ============================================================================
 *
 * The one integration point this milestone adds to the existing
 * pipeline: `services/analytics/analytics.service.ts` already assembles
 * both real live vehicles (Realtime Engine, Milestone 6) and real
 * deterministic predictions (Prediction Engine, Milestone 7) into one
 * shared context every time any `/api/analytics/*` or `/api/prediction/*`
 * route is hit — see that file's `computeContext()`. This service adds
 * one more consumer of that same already-computed data: instead of
 * fetching or predicting anything itself, `recordSnapshot()` is called
 * from `computeContext()` with the vehicles and predictions it already
 * has, and turns them into dataset rows.
 *
 * This is a request-driven, no-database, no-persistent-background-process
 * design — the same architecture every other engine in this codebase
 * uses (Realtime, Prediction, Analytics all cache against real data
 * freshness rather than running a separate timer). A consequence worth
 * being explicit about: rows are only appended when some client is
 * actually polling the dashboard, since that's what drives
 * `computeContext()` to run at all. That matches how this app already
 * behaves everywhere else (e.g. `trend.service.ts`'s rolling history),
 * and is the realistic use case for a dataset-collection pipeline
 * anyway — collecting real observations while the platform is being
 * actively monitored.
 *
 * Deduplication has two layers:
 *  1. If called again with the same `snapshotFetchedAtMs` (the Realtime
 *     Engine's own data-freshness identity — unchanged means "no new
 *     data since last time"), this is a no-op. This is the primary
 *     guard, since `computeContext()` can run more often than the
 *     underlying data actually refreshes.
 *  2. A bounded in-memory set of `vehicle_id:timestamp` keys guards
 *     against writing the exact same observation twice even across
 *     different snapshot identities, cleared once it grows large to
 *     keep memory bounded.
 * A real 15-second minimum interval between writes is enforced on top,
 * matching the milestone's "every polling cycle (15s)" requirement
 * regardless of how often `computeContext()` itself runs.
 */

import { appendRows, readExistingTimestamps, statDatasetFile } from "@/ml/dataset/csv-writer";
import type { DatasetRow, DatasetStats } from "@/ml/dataset/types";
import { buildFeatureRows } from "@/ml/features/feature-engineering";
import type { VehiclePrediction } from "@/types/prediction";
import type { RealtimeVehicle } from "@/types/realtime";

const MIN_EXPORT_INTERVAL_MS = 15_000;
const MAX_DEDUP_KEYS = 50_000;

interface ExporterState {
  initialized: boolean;
  totalRows: number;
  todayDateKey: string;
  todaySamples: number;
  lastExportedSnapshotFetchedAtMs: number | null;
  lastExportAtMs: number | null;
  recentRowKeys: Set<string>;
}

const state: ExporterState = {
  initialized: false,
  totalRows: 0,
  todayDateKey: "",
  todaySamples: 0,
  lastExportedSnapshotFetchedAtMs: null,
  lastExportAtMs: null,
  recentRowKeys: new Set(),
};

function todayDateKeyUtc(timestampMs: number = Date.now()): string {
  return new Date(timestampMs).toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/** One-time, lazy initialization from whatever is already on disk — so
 * stats are accurate across server restarts, not just for this process's
 * own writes. Only ever scans the file once per process lifetime. */
function ensureInitialized(): void {
  if (state.initialized) return;

  const existingTimestamps = readExistingTimestamps();
  const todayKey = todayDateKeyUtc();

  state.totalRows = existingTimestamps.length;
  state.todayDateKey = todayKey;
  state.todaySamples = existingTimestamps.filter((ts) => todayDateKeyUtc(ts) === todayKey).length;
  state.initialized = true;
}

function rollDayIfNeeded(): void {
  const todayKey = todayDateKeyUtc();
  if (todayKey !== state.todayDateKey) {
    state.todayDateKey = todayKey;
    state.todaySamples = 0;
  }
}

function dedupeRows(rows: readonly DatasetRow[]): DatasetRow[] {
  const fresh: DatasetRow[] = [];
  for (const row of rows) {
    const key = `${row.vehicle_id}:${row.timestamp}`;
    if (state.recentRowKeys.has(key)) continue;
    state.recentRowKeys.add(key);
    fresh.push(row);
  }
  if (state.recentRowKeys.size > MAX_DEDUP_KEYS) {
    state.recentRowKeys.clear();
  }
  return fresh;
}

/**
 * Generates one dataset row per vehicle from `vehicles`/`predictions`
 * and appends the new (non-duplicate) rows to `dataset.csv`, throttled
 * to at most once every 15 seconds. Safe to call on every
 * `computeContext()` invocation — most calls will be no-ops.
 */
export function recordSnapshot(
  vehicles: readonly RealtimeVehicle[],
  predictions: readonly VehiclePrediction[],
  snapshotFetchedAtMs: number,
): void {
  ensureInitialized();

  if (state.lastExportedSnapshotFetchedAtMs === snapshotFetchedAtMs) {
    return; // same underlying Realtime Engine data — nothing new to record
  }

  const now = Date.now();
  if (state.lastExportAtMs !== null && now - state.lastExportAtMs < MIN_EXPORT_INTERVAL_MS) {
    return; // not yet due for the next 15s sample
  }

  const candidateRows = buildFeatureRows(vehicles, predictions);
  const newRows = dedupeRows(candidateRows);
  if (newRows.length === 0) {
    state.lastExportedSnapshotFetchedAtMs = snapshotFetchedAtMs;
    return;
  }

  appendRows(newRows);

  rollDayIfNeeded();
  state.totalRows += newRows.length;
  const todayKey = state.todayDateKey;
  state.todaySamples += newRows.filter((row) => todayDateKeyUtc(row.timestamp) === todayKey).length;

  state.lastExportedSnapshotFetchedAtMs = snapshotFetchedAtMs;
  state.lastExportAtMs = now;
}

/** GET /api/ml/dataset/stats */
export function getDatasetStats(): DatasetStats {
  ensureInitialized();
  rollDayIfNeeded();

  const fileStat = statDatasetFile();

  return {
    totalRows: state.totalRows,
    lastUpdated: fileStat.lastModifiedMs,
    fileSize: fileStat.fileSizeBytes,
    todaySamples: state.todaySamples,
  };
}
