/**
 * OpenStreetMap tiles only — no Google Maps, no Mapbox token, no
 * proprietary map API. Kept alongside the zoom bounds already defined in
 * `services/map/map-utils.ts` so Leaflet and the existing zoom control
 * agree on the same range.
 */

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** DMRC network's real geographic center (Delhi), used before station bounds are known. */
export const DELHI_FALLBACK_CENTER: [number, number] = [28.6139, 77.209];
export const DELHI_FALLBACK_ZOOM = 11;
