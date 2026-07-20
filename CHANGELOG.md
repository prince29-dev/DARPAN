# Changelog

## Milestone 8 — AI Analytics + Digital Twin Operations Center

Transforms DARPAN from a realtime dashboard into a Digital Twin Operations
Platform: a complete Analytics Engine that continuously derives network
health, KPIs, route rankings, trend history, and rule-based AI insights
from the existing Realtime Engine (Milestone 6) and Prediction Engine
(Milestone 7) — no database, no machine learning, no random numbers.

**Milestones 1–7 are untouched functionally.** `app/api/realtime/*`,
`app/api/prediction/*`, `services/gtfs/*`, `services/realtime/*`,
`services/prediction/*`, and every existing store are unmodified. The 11
modified files listed below are additive extensions (new sections, new
optional props, new layer id) — no existing behavior was removed or
changed.

### New files — Backend (7)

| File | Summary |
|---|---|
| `types/analytics.ts` | `AnalyticsOverview`, `NetworkHealth`, `RouteAnalytics`, `TrendSeries`, `AIInsight`, `SystemHealthReport` — every Analytics Engine data contract. |
| `services/analytics/analytics.service.ts` | `AnalyticsEngine` composition root — assembles one shared context per request from `getVehiclePositionsSnapshot()` (M6) + `getPredictionEngine().predictBatch()` (M7), then delegates to the five services below. |
| `services/analytics/kpi.service.ts` | Reduces a `VehiclePrediction[]` batch into network-wide KPIs (vehicle count, avg ETA/delay, congestion index, avg speed, prediction confidence, active routes, route utilization). |
| `services/analytics/network-health.service.ts` | Deterministic 0-100 composite score from 5 weighted sub-scores (realtime availability, prediction health, API latency, vehicle freshness, congestion) to Excellent/Good/Fair/Poor/Critical band. |
| `services/analytics/route-analytics.service.ts` | Per-route (live feed's own route IDs) rankings: vehicle count, avg delay/ETA, congestion, speed, operational health, sorted busiest-first. |
| `services/analytics/trend.service.ts` | Lightweight in-memory ring buffer (max 120 points, no database) recording KPI snapshots over time, deduped to one record per 10s. |
| `services/analytics/insight.service.ts` | Rule-based, deterministic AI Insights (network health, prediction confidence, realtime delay, network-wide/per-route congestion, density hotspots), explicitly not machine learning. |

### New files — API routes (7)

| File | Summary |
|---|---|
| `app/api/analytics/_shared.ts` | Shared error-mapping helper (non-route, ignored by Next.js routing). |
| `app/api/analytics/overview/route.ts` | `GET /api/analytics/overview` |
| `app/api/analytics/network/route.ts` | `GET /api/analytics/network` |
| `app/api/analytics/routes/route.ts` | `GET /api/analytics/routes` |
| `app/api/analytics/trends/route.ts` | `GET /api/analytics/trends` |
| `app/api/analytics/insights/route.ts` | `GET /api/analytics/insights` |
| `app/api/analytics/health/route.ts` | `GET /api/analytics/health` — combined system health (network + prediction + GTFS). |

### New files — Frontend infrastructure (4)

| File | Summary |
|---|---|
| `hooks/use-async-resource.ts` | Generic fetch/loading/error/retry/auto-refresh hook, extracted from `use-prediction.ts` so `use-analytics.ts` doesn't duplicate it. |
| `lib/analytics-api.ts` | Centralized client for every `/api/analytics/*` call. |
| `hooks/use-analytics.ts` | `useAnalyticsOverview`, `useNetworkHealth`, `useRouteAnalytics`, `useTrends`, `useInsights`, `useSystemHealth`. |
| `components/map/network-health-badge.tsx` | Map "Health overlay" — live Network Health badge next to the existing Map Engine status. |

### New files — Analytics components (12)

| File | Summary |
|---|---|
| `components/analytics/analytics-visual-tokens.ts` | Shared health-band/congestion-level color and label mappings (real theme colors, not hand-picked hex). |
| `components/analytics/NetworkHealthCard.tsx` | 0-100 score, band badge, weighted breakdown bars. |
| `components/analytics/KPIGrid.tsx` | 8-tile KPI grid (reuses the existing `StatCard`). |
| `components/analytics/trend-chart-body.tsx` | Recharts line-chart implementation (dynamically imported, never SSR'd). |
| `components/analytics/TrendCharts.tsx` | Public wrapper: fetches trend series, lazy-loads the chart body. |
| `components/analytics/CongestionHeatmap.tsx` | Per-route congestion grid, opacity proportional to vehicle count. |
| `components/analytics/OperationsTimeline.tsx` | Vertical chronological event log of AI Insights. |
| `components/analytics/AIInsights.tsx` | Severity-colored alert rows. |
| `components/analytics/RouteRankingTable.tsx` | Sorted route table with congestion + operational health badges. |
| `components/analytics/PredictionAnalyticsSummary.tsx` | Prediction summary sourced from the server-computed overview (no client-side re-aggregation). |
| `components/analytics/NetworkAnalyticsPanel.tsx` | Compact live health + KPI composite (distinct from the M5 static-GTFS panel of the same name in `components/network/`). |
| `components/analytics/AnalyticsOverview.tsx` | Full Operations Center layout composing every component above. |

### Modified files (11)

| File | Change |
|---|---|
| `app/(dashboard)/dashboard/page.tsx` | Added a "Digital Twin Operations" section (Network Health, AI Insights, KPI Grid, Trend Charts, Congestion Heatmap, Operations Timeline, Route Rankings) between the existing Prediction Engine section and the legacy Analytics placeholder — nothing removed. |
| `app/(dashboard)/dashboard/analytics/page.tsx` | Rewritten into the Digital Twin Operations Center (`AnalyticsOverview`); old KPI/Trends/Prediction-Summary placeholders kept below under a "Legacy placeholders" heading for compatibility. |
| `types/map.ts` | Added `"prediction-overlay"` to `MapLayerId` (additive union member). |
| `components/map/map-context.tsx` | Added the "Prediction Overlay" entry to `DEFAULT_LAYERS` (default off). |
| `components/map/leaflet-network-map.tsx` | Reads the new layer's enabled state and passes it to `VehicleLayer`. |
| `components/map/vehicle-layer.tsx` | Added optional `showPredictionOverlay` prop; when on, fetches real congestion via the existing `usePredictionCongestion()` and colors markers accordingly; default behavior unchanged when omitted. |
| `lib/leaflet/vehicle-animation-manager.tsx` | Added `setCongestionColors()` and an optional congestion-color lookup used by marker creation/update; existing marker logic otherwise unchanged. |
| `lib/leaflet/vehicle-icon.ts` | Added an optional `congestionColor` parameter to `getVehicleIcon()`; omitted, behavior is identical to before. |
| `components/network/network-explorer.tsx` | Added `NetworkHealthBadge` next to the existing `MapStatus` badge. |
| `hooks/use-prediction.ts` | Internal refactor only: delegates to the new shared `useAsyncResource` instead of a private duplicate implementation. All exported hook signatures/behavior are unchanged. |
| `package.json` / `package-lock.json` | Added `recharts@^3.9.2` (peer-compatible with React 19) for `TrendCharts`. |

### Verification performed

- `tsc --noEmit` — clean.
- `eslint . --max-warnings=0` — clean.
- `next build` — clean; all 6 new `/api/analytics/*` routes correctly dynamic (`f`), all pages compile.
- Full pipeline run against the real 5,356-vehicle sample feed (standalone script, not just type-checked):
  - `computeOverview` — deterministic across repeated calls.
  - `computeNetworkHealth` — score/band/breakdown deterministic (only the intentionally time-varying `vehicleFreshnessMs` differs between calls, as designed).
  - `computeRouteAnalytics` — 1,333 live routes; vehicle-count sum matches total predictions exactly (no data loss in the group-by).
  - `generateInsights` — 3 correct, real insights generated (network-wide congestion at 79/100, worst route 3475 at severe density, a real density hotspot at 28.668, 77.226).
  - `trend.service` dedup verified: two rapid `recordTrendSnapshot()` calls produce exactly one history point.

### Not in scope for this milestone (by design)

No machine learning, no database, no changes to the Realtime Engine, GTFS
Parser, Vehicle Loader, or any Milestone 1-7 API contract.


## Milestone 7 — Phase 1: Prediction Engine Architecture

Architecture-only phase: a modular, SOLID-compliant Prediction Engine that
produces deterministic ETA, Delay, and Congestion estimates from the
existing, **untouched** Realtime Engine's live vehicle data. No machine
learning, no `Math.random()`, no database — every number is either a real
measurement (congestion, from live vehicle spatial density) or a
reproducible seeded placeholder (ETA, delay), and every API response says
which. See `docs/ARCHITECTURE.md` § Milestone 7 for the full design
rationale, including why the composition order is Congestion → ETA →
Delay rather than the reverse.

**Zero Milestone 1–6 files were modified.** All 14 files below are new.

### Types (4 files)

| File | Summary |
|---|---|
| `types/congestion.ts` | `CongestionLevel`, `CongestionAssessment` — a real, measured spatial-density result (nearby live-vehicle count within a fixed radius), not a placeholder. |
| `types/eta.ts` | `EtaSpeedSource`, `EtaEstimate` — deterministic ETA result, tagged with `speedSource` ("reported" vs "assumed") and a data-completeness `confidence` score. |
| `types/delay.ts` | `DelayCategory`, `DelayEstimate` — schedule-adherence result; `predictedDelaySeconds` is nullable by design for any trip without a `SCHEDULED` schedule reference. |
| `types/prediction.ts` | `VehiclePrediction`, `PredictionDisclaimer`, `PredictionListResponse<T>`, `PredictionSingleResponse<T>`, `PredictionEngineStatus` — the composition-root and API envelope types. |

### Services (5 files)

| File | Summary |
|---|---|
| `services/prediction/utils/deterministic-math.ts` | Shared, seed-based (FNV-1a hash) numeric helpers — `hashToUnitInterval`, `mapToRange`, `clamp`, `roundTo`. Never `Math.random()`. Added beyond the four named files to keep `eta.service.ts`/`delay.service.ts` from duplicating identical hashing logic. |
| `services/prediction/congestion.service.ts` | `CongestionService` (`ICongestionService`) — counts real live neighbors within 0.5 km using the existing `haversineKm` (Milestone 5, reused not reimplemented) and classifies density into low/moderate/high/severe. |
| `services/prediction/eta.service.ts` | `EtaService` (`IEtaService`) — deterministic, congestion-adjusted ETA. Prefers the feed's real reported speed when usable; falls back to a seeded assumption only when it isn't (the live OTD feed always reports `speed: 0`). |
| `services/prediction/delay.service.ts` | `DelayService` (`IDelayService`) — returns `null` (not a fabricated number) for any trip whose `schedule_relationship` isn't `SCHEDULED`; otherwise a seeded placeholder delay. |
| `services/prediction/prediction.service.ts` | `PredictionEngine` (`IPredictionEngine`) — composition root. Constructor-injects the three services above (Dependency Inversion), calls them in dependency order (Congestion → ETA → Delay), and exposes `predict()` / `predictBatch()` plus a `getPredictionEngine()` singleton factory. |

### API routes (5 files)

| File | Summary |
|---|---|
| `app/api/prediction/_shared.ts` | Shared, non-route helper (underscore-prefixed, ignored by Next.js routing): disclaimer builder, `?limit=` pagination parsing, error → HTTP-status mapping. |
| `app/api/prediction/eta/route.ts` | `GET /api/prediction/eta` — `?vehicleId=` for one vehicle (404 if not live) or `?limit=` for a batch (default 100, max 1000). |
| `app/api/prediction/delay/route.ts` | `GET /api/prediction/delay` — same contract, returns `DelayEstimate`. |
| `app/api/prediction/congestion/route.ts` | `GET /api/prediction/congestion` — same contract, returns `CongestionAssessment`. |
| `app/api/prediction/status/route.ts` | `GET /api/prediction/status` — health/capability check: methodology, live vehicle count, last Realtime Engine update, available endpoints. |

### Verification performed

- `tsc --noEmit` — clean.
- `eslint . --max-warnings=0` — clean.
- `next build` — clean; all 4 new routes correctly registered as dynamic (`ƒ`).
- Functional test against the real 5,356-vehicle Milestone 6 sample feed:
  - **Determinism**: identical `predict()` output (excluding wall-clock `computedAtMs`) across repeated calls and across fresh `PredictionEngine` instances.
  - **Delay honesty**: 0/3,541 non-`SCHEDULED` trips given a fabricated delay figure; 0/1,815 `SCHEDULED` trips missing one.
  - **Bounds**: 0 out-of-range confidence values; 0 invalid (`NaN`/negative/infinite) ETA seconds across all 5,356 vehicles.

### Not in scope for this phase (by design)

No ML frameworks, no trained models, no database, no changes to the
Realtime Engine, GTFS Parser, Vehicle Loader, dashboard layout, or any
existing component/hook/store.
