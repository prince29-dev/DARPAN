import L from "leaflet";

import { colors } from "@/constants/theme";
import type { NetworkMarkerVariant } from "@/types/network";

interface MarkerStyle {
  size: number;
  fill: string;
  ring: string;
  ringWidth: number;
}

const VARIANT_STYLE: Record<NetworkMarkerVariant, MarkerStyle> = {
  normal: { size: 9, fill: colors.foreground, ring: colors.border, ringWidth: 1.5 },
  interchange: { size: 13, fill: colors.accent, ring: colors.background, ringWidth: 2 },
  terminal: { size: 11, fill: colors.signal, ring: colors.background, ringWidth: 2 },
  selected: { size: 16, fill: colors.accent, ring: colors.foreground, ringWidth: 2.5 },
  hovered: { size: 12, fill: colors.foreground, ring: colors.accent, ringWidth: 2 },
};

const iconCache = new Map<string, L.DivIcon>();

/**
 * Returns a cached DivIcon for a marker variant so re-renders (hover,
 * pan, zoom) reuse the same icon instances instead of rebuilding SVG
 * markup thousands of times per frame.
 */
export function getStationIcon(variant: NetworkMarkerVariant): L.DivIcon {
  const cached = iconCache.get(variant);
  if (cached) return cached;

  const style = VARIANT_STYLE[variant];
  const box = style.size + style.ringWidth * 2 + 4;
  const center = box / 2;
  const radius = style.size / 2;

  const html = `<svg width="${box}" height="${box}" viewBox="0 0 ${box} ${box}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="${style.fill}" stroke="${style.ring}" stroke-width="${style.ringWidth}" />
  </svg>`;

  const icon = L.divIcon({
    html,
    className: "darpan-station-marker",
    iconSize: [box, box],
    iconAnchor: [center, center],
  });

  iconCache.set(variant, icon);
  return icon;
}
