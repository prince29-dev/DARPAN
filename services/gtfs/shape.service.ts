import "server-only";

import { loadGtfsDataset } from "@/services/gtfs/loader";
import type { Shape } from "@/types/shape";

let cachedShapeIds: string[] | null = null;

export function getShapeIds(): string[] {
  if (cachedShapeIds) return cachedShapeIds;

  const { shapes } = loadGtfsDataset();
  cachedShapeIds = Array.from(new Set(shapes.map((point) => point.shape_id))).sort();
  return cachedShapeIds;
}

export function getShapeById(id: string): Shape | undefined {
  const { shapes } = loadGtfsDataset();
  const points = shapes
    .filter((point) => point.shape_id === id)
    .map((point) => ({
      lat: Number.parseFloat(point.shape_pt_lat),
      lon: Number.parseFloat(point.shape_pt_lon),
      sequence: Number.parseInt(point.shape_pt_sequence, 10),
      distTraveled:
        point.shape_dist_traveled.length > 0 ? Number.parseFloat(point.shape_dist_traveled) : null,
    }))
    .sort((a, b) => a.sequence - b.sequence);

  if (points.length === 0) return undefined;

  return { id, points };
}

export function getShapeCount(): number {
  return getShapeIds().length;
}
