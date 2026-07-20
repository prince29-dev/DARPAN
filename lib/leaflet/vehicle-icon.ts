import L from "leaflet";

import { colors } from "@/constants/theme";

const SIZE = 16;

const iconCache = new Map<string, L.DivIcon>();

/**
 * Bus glyph, optionally rotated to a real `bearing` reported by the feed.
 * Rotation is bucketed to the nearest 10° so repeated `getVehicleIcon`
 * calls across thousands of vehicles reuse a handful of cached icons
 * instead of building fresh SVG per vehicle per poll. When a feed (like
 * the current OTD one) never reports `bearing`, every vehicle uses the
 * unrotated "unknown heading" icon rather than a fabricated direction.
 *
 * `congestionColor` (Milestone 8) optionally recolors the unselected
 * marker fill — used by the map's Prediction Overlay to show real,
 * per-vehicle congestion from the Prediction Engine. Omitted, the
 * marker keeps its Milestone 6 default color; existing callers are
 * unaffected.
 */
export function getVehicleIcon(
  bearing: number | null,
  selected: boolean,
  congestionColor?: string,
): L.DivIcon {
  const bucket = bearing === null ? "none" : Math.round(bearing / 10) * 10;
  const key = `${bucket}:${selected ? "sel" : "std"}:${congestionColor ?? "default"}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const fill = selected ? colors.accent : (congestionColor ?? colors.signal);
  const box = selected ? SIZE + 6 : SIZE;
  const center = box / 2;
  const rotation = bearing ?? 0;

  const arrow =
    bearing !== null
      ? `<path d="M ${center} 2 L ${center + 4} ${center + 3} L ${center} ${center + 1} L ${center - 4} ${center + 3} Z" fill="${fill}" transform="rotate(${rotation} ${center} ${center})" />`
      : `<circle cx="${center}" cy="${center}" r="${box / 2 - 2}" fill="${fill}" stroke="${colors.background}" stroke-width="1.5" />`;

  const html = `<svg width="${box}" height="${box}" viewBox="0 0 ${box} ${box}" xmlns="http://www.w3.org/2000/svg">${arrow}</svg>`;

  const icon = L.divIcon({
    html,
    className: "darpan-vehicle-marker",
    iconSize: [box, box],
    iconAnchor: [center, center],
  });

  iconCache.set(key, icon);
  return icon;
}
