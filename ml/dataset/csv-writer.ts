import "server-only";

/**
 * ============================================================================
 * DARPAN — Milestone 9.1: Dataset Generation Pipeline
 * Module: CSV writer (ml/dataset/)
 * ============================================================================
 *
 * Pure file I/O for `dataset.csv` — path resolution, auto-creating the
 * file with a header row if it doesn't exist, appending rows, and
 * reading it back for stats. No feature logic and no throttling lives
 * here; that's `ml/features/feature-engineering.ts` and
 * `ml/exporter/dataset-export.service.ts` respectively — this module's
 * only job is "how to read and write the file."
 *
 * Node's synchronous `fs` calls are used deliberately: JS execution on a
 * single Node process is single-threaded, so a sync append can never
 * interleave with another write from the same process — no separate
 * locking needed. This does mean a horizontally-scaled (multi-instance)
 * deployment would need a shared store instead of local disk; out of
 * scope for this milestone, called out here rather than silently assumed
 * away.
 *
 * Storage path defaults to `data/ml/dataset.csv` (mirrors the existing
 * `data/gtfs/` convention), overridable via `ML_DATASET_PATH` for
 * deployments that need to point it at a persistent volume or `/tmp`.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DATASET_COLUMNS, type DatasetRow } from "@/ml/dataset/types";

const DEFAULT_DATASET_PATH = path.join(process.cwd(), "data", "ml", "dataset.csv");

export function resolveDatasetPath(): string {
  const override = process.env.ML_DATASET_PATH?.trim();
  return override ? path.resolve(override) : DEFAULT_DATASET_PATH;
}

/** Wraps a field in quotes (doubling any internal quotes) only if it
 * actually needs it — commas, quotes, or newlines. Defensive: current
 * real values (vehicle/route/trip IDs) never contain these, but a
 * dataset writer should never assume that stays true forever. */
function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCell(value: DatasetRow[keyof DatasetRow]): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  return escapeCsvField(value);
}

function rowToCsvLine(row: DatasetRow): string {
  return DATASET_COLUMNS.map((column) => formatCell(row[column])).join(",");
}

function headerLine(): string {
  return DATASET_COLUMNS.join(",");
}

/** Creates the dataset directory + file (with header row) if either is
 * missing. Safe to call before every write — a no-op once the file exists. */
export function ensureDatasetFile(): string {
  const filePath = resolveDatasetPath();
  const dir = path.dirname(filePath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(filePath)) {
    writeFileSync(filePath, headerLine() + "\n", "utf8");
  }

  return filePath;
}

/** Appends `rows` to the dataset file, creating it first if needed.
 * No-op (and does not touch the file) if `rows` is empty. */
export function appendRows(rows: readonly DatasetRow[]): void {
  if (rows.length === 0) return;
  const filePath = ensureDatasetFile();
  const lines = rows.map(rowToCsvLine).join("\n") + "\n";
  appendFileSync(filePath, lines, "utf8");
}

export interface DatasetFileStat {
  exists: boolean;
  fileSizeBytes: number;
  lastModifiedMs: number | null;
}

/** Real file-system stat — `lastModifiedMs` and `fileSizeBytes` are never
 * tracked separately in memory; they always reflect the actual file. */
export function statDatasetFile(): DatasetFileStat {
  const filePath = resolveDatasetPath();
  if (!existsSync(filePath)) {
    return { exists: false, fileSizeBytes: 0, lastModifiedMs: null };
  }
  const stats = statSync(filePath);
  return { exists: true, fileSizeBytes: stats.size, lastModifiedMs: stats.mtimeMs };
}

/**
 * Reads every existing row's `timestamp` column, for one-time stats
 * initialization (row count + today's sample count) when the server
 * process starts with a dataset file already on disk. Only ever called
 * once per process lifetime — see `dataset-export.service.ts`.
 */
export function readExistingTimestamps(): number[] {
  const filePath = resolveDatasetPath();
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n").filter((line) => line.length > 0);
  if (lines.length <= 1) return []; // header only, or empty

  // `timestamp` is always the first column (DATASET_COLUMNS[0]) — parsing
  // up to the first comma is correct as long as that invariant holds.
  const timestamps: number[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const firstComma = line.indexOf(",");
    const rawTimestamp = firstComma === -1 ? line : line.slice(0, firstComma);
    const parsed = Number.parseInt(rawTimestamp, 10);
    if (Number.isFinite(parsed)) timestamps.push(parsed);
  }

  return timestamps;
}
