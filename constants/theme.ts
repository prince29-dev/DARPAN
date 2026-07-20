/**
 * DARPAN design tokens.
 *
 * CSS consumes these as HSL triples via CSS custom properties in
 * `styles/globals.css`. This module mirrors the same values as hex
 * strings for contexts that cannot read CSS variables — canvas, SVG
 * fills, chart libraries, and map renderers introduced in later
 * milestones.
 *
 * Keep this file and `styles/globals.css` in sync manually; there is
 * no build-time generation step by design, so the palette stays a
 * deliberate, reviewed choice rather than a generated one.
 */

export const colors = {
  background: "#0A0B0D",
  surface: "#101215",
  surfaceElevated: "#15171B",
  border: "#1F2226",
  foreground: "#EDEEF0",
  mutedForeground: "#8B9096",
  accent: "#00C2B2",
  accentForeground: "#04110F",
  signal: "#FFB020",
  signalForeground: "#1A1103",
  destructive: "#E5484D",
  destructiveForeground: "#FFF4F4",
} as const;

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
} as const;

export const fonts = {
  display: "Space Grotesk",
  sans: "Inter",
  mono: "IBM Plex Mono",
} as const;

export type ThemeColorToken = keyof typeof colors;
