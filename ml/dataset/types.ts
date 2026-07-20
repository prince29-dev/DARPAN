/**
 * ============================================================================
 * DARPAN — Milestone 9.1: Dataset Generation Pipeline
 * Domain: ML Dataset
 * ============================================================================
 *
 * `DatasetRow` is one training sample: one live vehicle observation, at
 * one moment, joined with the deterministic Prediction Engine output for
 * that same vehicle at that same moment. Every field traces back to a
 * real observation from the Realtime Engine (Milestone 6) or a
 * deterministic computation from the Prediction Engine (Milestone 7) —
 * see `ml/features/feature-engineering.ts` for exactly how each column
 * is derived. Nullable fields (`speed`, `bearing`, `stop_sequence`,
 * `deterministic_delay`) are `null` when the live feed genuinely doesn't
 * report that value for this vehicle/trip, never a fabricated default.
 */

export interface DatasetRow {
  /** Epoch milliseconds — the vehicle's own reported timestamp. */
  timestamp: number;
  vehicle_id: string;
  route_id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  /** Meters/second, as reported by the feed. Null if not reported. */
  speed: number | null;
  /** Compass degrees, as reported by the feed. Null if not reported. */
  bearing: number | null;
  /** Null if the feed doesn't report a current stop sequence for this vehicle. */
  stop_sequence: number | null;
  /** Prediction Engine's real spatial-density measurement, in [0, 1]. */
  congestion_index: number;
  /** Prediction Engine's deterministic ETA estimate, in seconds. */
  deterministic_eta: number;
  /** Prediction Engine's deterministic delay estimate, in seconds.
   * Null for trips with no schedule reference (schedule_relationship !== SCHEDULED). */
  deterministic_delay: number | null;
}

/** Column order the CSV file is written in — the single source of truth
 * both the writer and the header derive from. */
export const DATASET_COLUMNS: readonly (keyof DatasetRow)[] = [
  "timestamp",
  "vehicle_id",
  "route_id",
  "trip_id",
  "latitude",
  "longitude",
  "speed",
  "bearing",
  "stop_sequence",
  "congestion_index",
  "deterministic_eta",
  "deterministic_delay",
] as const;

/** Response shape for `GET /api/ml/dataset/stats`. */
export interface DatasetStats {
  totalRows: number;
  /** Epoch milliseconds the dataset file was last written to, or `null`
   * if the file doesn't exist yet. */
  lastUpdated: number | null;
  /** Bytes on disk, or 0 if the file doesn't exist yet. */
  fileSize: number;
  /** Rows whose `timestamp` falls on the current UTC calendar day. */
  todaySamples: number;
}
