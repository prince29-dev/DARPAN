/**
 * ============================================================================
 * DARPAN — Milestone 7 Phase 1: Prediction Engine Architecture
 * Shared utility: Deterministic Mathematics
 * ============================================================================
 *
 * Pure, seed-based numeric helpers used by `eta.service.ts` and
 * `delay.service.ts` wherever the underlying real-world value isn't yet
 * measurable (see those files' module docs for exactly which fields and
 * why). Given the same seed string, every function here returns the
 * exact same output on every call, on every machine, forever.
 *
 * Explicitly NOT used here, by design: `Math.random()`, `Date.now()` as
 * an entropy source, or any other non-reproducible input. That is what
 * "deterministic" means for this milestone — reproducible placeholder
 * numbers, not accurate forecasts.
 *
 * This is the one small addition beyond the four files the Milestone 7
 * Phase 1 brief named for `services/prediction/` — introduced to keep
 * `eta.service.ts` and `delay.service.ts` from duplicating identical
 * hashing/mapping logic (see the Integration Notes in the final summary).
 */

/**
 * FNV-1a 32-bit hash. Chosen for being fast, dependency-free, and having
 * good avalanche behavior for short string keys like vehicle/trip ids —
 * not for cryptographic strength, which is irrelevant here.
 */
function fnv1aHash(seed: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return hash >>> 0; // coerce to unsigned 32-bit
}

/**
 * Deterministically maps any string seed to a value in [0, 1).
 * `hashToUnitInterval("A") !== hashToUnitInterval("B")` for virtually all
 * A ≠ B, and `hashToUnitInterval("A") === hashToUnitInterval("A")` always.
 */
export function hashToUnitInterval(seed: string): number {
  return fnv1aHash(seed) / 0x1_0000_0000;
}

/** Linearly maps a unit value in [0, 1) into the closed interval [min, max]. */
export function mapToRange(unit: number, min: number, max: number): number {
  return min + unit * (max - min);
}

/** Clamps `value` into the closed interval [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rounds `value` to `decimals` decimal places (plain round-half-up). */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
