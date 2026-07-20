# DARPAN Architecture

## Purpose of this document

This describes the foundation laid in Milestone 1: folder responsibilities,
design system decisions, and the seams where future engines (GTFS, Realtime,
Simulation, AI, Prediction, Analytics, Research, 3D, Digital Twin Core)
attach without restructuring what already exists.

## Folder responsibilities

| Folder | Responsibility |
|---|---|
| `app/` | Routes, layouts, route-level loading/error/not-found states. No business logic. |
| `components/ui/` | Framework-agnostic, style-only primitives (Button, Card, Modal, Section). No domain knowledge. |
| `components/layout/` | Structural chrome — theme provider now; sidebar, top nav, dashboard shell arrive in Milestone 2. |
| `components/dashboard/` | Dashboard-specific composed views. Empty until Milestone 4. |
| `components/common/` | Cross-cutting states — loading, empty, error boundary. Used by any route or engine. |
| `hooks/` | Reusable React hooks. Empty until a milestone introduces stateful client behavior. |
| `lib/` | Framework-level helpers and third-party integration glue (e.g. `cn`). |
| `utils/` | Pure, dependency-free utility functions with no React or Next.js awareness. Kept separate from `lib/` so domain engines can import utilities without pulling in framework code. |
| `services/` | Future home for engine clients (GTFS Engine, Realtime Engine, AI Engine, etc.), each as an isolated module behind a typed interface. Empty by design in Milestone 1. |
| `types/` | Shared TypeScript types. `common.ts` holds structural UI types; each future engine adds its own file here without touching existing types. |
| `constants/` | Static, non-secret configuration — starting with design tokens in `theme.ts`. |
| `styles/` | Global CSS and design-token CSS variables. |
| `docs/` | Architecture and decision records. |

This table is the Milestone 1 snapshot. Each milestone section below
documents the folders it actually added or changed (e.g. Milestone 5 adds
`components/network/`, `services/map/`, `lib/leaflet/`, `types/network.ts`)
rather than rewriting this table, so the sequencing stays visible.

## Design system

Tokens live in two synchronized places by design, not accident:

- `styles/globals.css` — CSS custom properties consumed by Tailwind utility
  classes across the app.
- `constants/theme.ts` — the same palette as hex values, for contexts that
  cannot read CSS variables: canvas, SVG, and the map/3D renderers that later
  milestones introduce.

Palette, type, and motion choices are documented inline as code comments are
avoided in favor of this document staying current.

- **Color** — near-black control-room background (`#0A0B0D`) with a teal
  signal accent (`#00C2B2`) for primary interaction and an amber accent
  (`#FFB020`) reserved for live/real-time indicators once the Realtime Engine
  lands.
- **Type** — Space Grotesk (display), Inter (body/UI), IBM Plex Mono (data
  readouts, coordinates, timestamps — the register transit displays already
  use).
- **Motion** — a single signature: the `signal-pulse` keyframe, a radar-ping
  used for live-status indicators. Reused rather than re-invented so later
  milestones (a live train marker, a "data streaming" badge) inherit it
  instead of adding a new animation each time.

## Why `services/` is empty

Every future engine (GTFS, Realtime, Simulation, AI, Prediction, Analytics,
Research) is planned as a subfolder of `services/` exposing a typed client
and nothing else — no engine reaches into another engine's internals or into
`components/`. Components consume engines only through hooks in `hooks/`.
This boundary is why it is safe to add engines later without refactoring the
foundation built here.

## Milestone sequence

1. **Foundation & design system** ✅ — tokens, primitives, states, theming.
2. **Application shell** ✅ — sidebar, top navigation, command palette,
   notification and profile placeholders, right utility panel, mobile
   navigation drawer, dashboard placeholder wired to nav.
3. **Landing page & enterprise dashboard** ✅ — public marketing site,
   redesigned dashboard IA (Overview, Network, Stations, Routes, Trips,
   Analytics, Simulation, AI Lab, Settings), map architecture, station/route
   explorer shells, AI Lab prediction cards.
4. **GTFS Engine** ✅ — the real DMRC GTFS Static feed is parsed and powers
   Overview, Stations, Routes, and Trips. No fabricated data anywhere.
5. **Real Metro Map Engine** ✅ — `services/gtfs/network.service.ts`
   composes the Milestone 4 services into a topology graph; a real Leaflet
   + OpenStreetMap renderer slots into `MapCanvas` exactly as this doc
   predicted, and the Network page becomes a search/filter/select
   digital-twin surface.
6. **Realtime GTFS-Realtime Engine** ✅ — decodes the real OTD
   `VehiclePositions.pb` feed server-side, polls it from the browser via
   `/api/realtime/vehicles`, and renders live vehicles on the Network map
   as a toggleable `vehicles` layer (renamed from the Milestone 3
   placeholder `live-trains`, since the real feed turned out to be Delhi's
   bus fleet, not metro trains — see below).
7. **Simulation, AI** — next.

## Milestone 6 additions (Realtime GTFS-Realtime Engine)

**The feed doesn't map onto the DMRC static network — verified, not assumed.**
Before writing any code, the real `VehiclePositions.pb` sample was decoded
with `gtfs-realtime-bindings` and cross-checked against `data/gtfs/`:
5,356 vehicles, 1,333 distinct `route_id`s (numeric bus-route codes, not
the 36 DMRC line IDs), **zero** `trip_id` overlap with `trips.txt`, and a
lat/lon spread reaching well into Haryana/NCR — far beyond the metro
corridor. This is Delhi's open bus-fleet feed, a separate GTFS-Realtime
source from a different agency. The architecture below reflects that:
vehicles render as their own independent layer with their own real IDs,
never joined to `RouteService`/`StationService` by a fabricated match.

**Presence vs. zero-value, the bug that would have silently fabricated data.**
protobufjs only sets a decoded field as the message instance's *own*
property when the wire actually contained it; an unset proto3 scalar
field reads through to a prototype-level zero-value (`0`, `""`) that is
indistinguishable from a real zero by plain property access. An early
version of `normalize.ts` read `position.bearing ?? null` and got `0` for
every vehicle — silently fabricating "bearing: 0°" for a feed that never
sends bearing at all. Verified with `Object.prototype.hasOwnProperty`
against the real sample: `bearing`, `odometer`, `currentStatus`, `stopId`,
`currentStopSequence`, `licensePlate`, and `directionId` are absent on
all 5,356 entities; `speed` is genuinely present (and always exactly
`0`). `services/realtime/normalize.ts`'s `presentOrNull()` helper fixes
this generically, so every optional field is `null` unless truly sent —
verified end-to-end against the real sample file, not just type-checked.

**Server/browser split, so `OTD_API_KEY` never reaches the client.**
`OTD_API_KEY` has no `NEXT_PUBLIC_` prefix — Next.js keeps it server-only
by convention. So the "RealtimeClient" is two pieces, not one:
`services/realtime/otd-feed-client.ts` (server-only: the only place the
key is read; AbortController timeout, retry with backoff, and explicit
401/403/404/429/5xx classification — 401/403/404 fail fast rather than
retrying) is called by `services/realtime/realtime.service.ts`
(fetch → `decoder.ts` → `normalize.ts`, with a 5s cache + in-flight
coalescing so concurrent requests don't multiply upstream calls), which
`app/api/realtime/vehicles/route.ts` exposes as JSON. The browser only
ever talks to that same-origin route via
`services/realtime/vehicle-feed-client.ts` — no key, no CORS, no protobuf
in the browser bundle.

**Polling engine, store, and hooks.** `services/realtime/polling-engine.ts`
is a ref-counted singleton (any number of `useRealtime`/`useVehicles`/
`useVehicle`/`useConnectionStatus` call sites share one poll loop),
schedules via the store's configurable `pollIntervalMs` (default 15s),
pauses on `document.visibilitychange` and resumes immediately on
foreground, and backs off exponentially on failure (capped, with 401/403
parked at the max interval rather than hammering a feed that won't
recover without a new key). `stores/realtime-store.ts` (Zustand) is the
single source of truth every hook reads via selectors — "notify
subscribers" is just Zustand's normal re-render-on-change behavior,
nothing bespoke.

**Map integration, built to handle thousands of markers without
rerendering the map.** `components/map/vehicle-layer.tsx` mounts inside
`MapContainer` (needs `useMap()`) and hands each new snapshot to
`lib/leaflet/vehicle-animation-manager.tsx`, which owns a Leaflet
`LayerGroup` **imperatively** — outside React's reconciliation entirely.
`sync()` diffs the incoming vehicle list against tracked markers (add/
remove/update), and updates ease a moved marker to its new position via
`requestAnimationFrame` instead of teleporting. This is a deliberate
deviation from Milestone 5's declarative `<Marker>`-per-station pattern:
5,356 React-managed markers refreshed every 15s would fight Leaflet's DOM
model and cause exactly the "rerender the entire map" problem the brief
warns against, so "VehicleMarker" is implemented as plain marker
construction inside the manager rather than a separate React component —
explained here rather than shipped as unused/duplicate code.
`lib/leaflet/vehicle-icon.ts` caches divIcons per rotation bucket;
`components/map/vehicle-popup.tsx` is a plain React component rendered to
a Leaflet popup on click via `renderToStaticMarkup` (reused, not
duplicated, since it's the only place vehicle detail markup lives). Every
field the current feed doesn't send — bearing, speed beyond the reported
`0`, status — reads "Not reported" rather than a fabricated value.

**Dashboard, top nav, debug panel.** `components/layout/connection-status.tsx`
(shared by the top navigation and the dashboard hero strip) and
`components/dashboard/realtime-status-card.tsx` both read
`useConnectionStatus()`. `components/dashboard/realtime-debug-panel.tsx`
renders only when `NODE_ENV === "development"` and shows raw entity
count, decoded vehicle count, response size, client/upstream latency, a
live polling countdown, and reconnect attempts.

## Milestone 5 additions (Real Metro Map Engine)

**Map rendering pipeline, end to end:**

1. `app/(dashboard)/dashboard/network/page.tsx` (Server Component) calls
   `getNetworkStations()`, `getNetworkRoutes()`, `getNetworkAnalytics()`,
   `getNetworkBounds()` from `services/gtfs/network.service.ts`, plus the
   existing `getAllTrips()`, at request time.
2. `network.service.ts` does **no new parsing** — it reuses
   `loader.ts`'s cached `stopTimes`/`trips` join and the existing
   `StationService`/`RouteService`/`ShapeService`/`TripService` to derive:
   station→routes membership, interchange/terminal flags, each station's
   5 nearest real neighbours (haversine), each route's representative
   trip (most stops), that trip's GTFS shape as a `path`, and network-wide
   analytics. Falls back to the representative trip's real station
   coordinates only if a trip has no shape — never invents a point.
   `services/map/route-colors.ts` documents the one non-GTFS decision:
   DMRC's feed leaves `route_color` blank, so lines get a deterministic
   (hash-of-route-id) palette color instead of nothing.
3. That data is passed as props into `components/network/network-
   explorer.tsx`, which wraps the page in two client contexts:
   `MapProvider` (Milestone 3, extended additively with selection/hover/
   fly-to/live-engine-status — the original zoom/layer API is untouched)
   and the new `NetworkDataProvider` (stations/routes/analytics + id
   lookup maps, so nested panels never prop-drill).
4. `MapCanvas` (Milestone 3's placeholder) now branches: no data → the
   original inert grid; real data → `next/dynamic`-imports
   `components/map/leaflet-network-map.tsx` with `ssr: false`, since
   Leaflet needs `window`. That file renders `react-leaflet`'s
   `MapContainer` + OpenStreetMap `TileLayer` (`lib/leaflet/config.ts` —
   no Google Maps, no Mapbox key), a `Marker` per station using cached
   `DivIcon`s from `lib/leaflet/icons.ts` (variant = normal / interchange
   / terminal / selected / hovered, styled from `constants/theme.ts`
   tokens), and a `Polyline` per route's real shape. `FlyToController`,
   `ZoomSyncController`, and `EngineStatusReporter` are small child
   components (they need `useMap()`, so they must live inside
   `MapContainer`) that bridge `MapContext` state into the live Leaflet
   instance in both directions.
5. `components/network/` holds the page furniture around the map:
   `network-search-panel.tsx` (debounced scoped search via
   `hooks/use-network-search.ts`), `network-line-filter.tsx` (per-route
   visibility + live color key), `network-analytics-panel.tsx`, and
   `network-info-panel.tsx` (the right-hand selected station/route
   detail, reusing the `<dl>`/`Field` pattern from `StationsExplorer`).

`services/gtfs/shape.service.ts` and `types/shape.ts` (Milestone 4) are
unchanged — they were already correct, just unused by any UI until now.

## Milestone 4 additions (GTFS Engine)

The real DMRC GTFS Static feed (`agency.txt`, `calendar.txt`, `routes.txt`,
`stops.txt`, `trips.txt`, `stop_times.txt`, `shapes.txt`) ships in
`data/gtfs/` and is the **only** source of transit data in the app — every
number on the Overview page, every station/route/trip, and the landing
page's network-scale stats are computed from these files at request/build
time. Nothing is hardcoded.

- `services/gtfs/parser.ts` — a small dependency-free CSV parser (handles
  quoted fields per RFC 4180) plus typed row interfaces
  (`GtfsStopRow`, `GtfsRouteRow`, `GtfsTripRow`, `GtfsStopTimeRow`,
  `GtfsShapeRow`, `GtfsCalendarRow`, `GtfsAgencyRow`) for each GTFS file.
- `services/gtfs/loader.ts` — reads the seven files from `data/gtfs/` via
  `node:fs`, parses them, and caches the result for the life of the server
  process. Marked `import "server-only"` so it can never be pulled into a
  client bundle.
- `services/gtfs/cache.ts` — the generic memoization primitive `loader.ts`
  and the domain services build on.
- `services/gtfs/station.service.ts`, `route.service.ts`, `trip.service.ts`,
  `shape.service.ts` — each derives one domain type
  (`types/station.ts` → `Station`, `types/route.ts` → `RouteSummary`,
  `types/trip.ts` → `Trip`, `types/shape.ts` → `Shape`/`ShapePoint`) from the
  raw parsed rows. Trip counts per route and stop counts per trip are
  computed by grouping, not stored or guessed.
- `services/gtfs/statistics.ts` — the single source of the four headline
  numbers (stations, routes, trips, stop times) plus agency name and
  service-calendar count, consumed by both the dashboard Overview page and
  the landing page's stats section (`constants/stats.ts` and
  `constants/dashboard-overview.ts` are thin presentation-layer mappers over
  this — no numbers live in either file).
- **Stations** (`/dashboard/stations`) — real-time client-side search by
  station name over all 262 stations, with a details panel showing name,
  latitude, longitude, and station ID exactly as parsed.
- **Routes** (`/dashboard/routes`) — every route from `routes.txt`, each
  card showing route name, route ID, and a trip count computed by counting
  matching rows in `trips.txt`.
- **Trips** (`/dashboard/trips`) — every trip from `trips.txt`, searchable by
  Trip ID, paginated client-side (50 per page) since the real dataset is
  ~5,400 trips.
- No map renderer, no live API, and no AI were added this milestone, per
  scope — `MapCanvas` and the rest of `components/map/` from Milestone 3 are
  untouched. (The real map renderer is Milestone 5, described above.)

## Milestone 3 additions

- `app/page.tsx` — public landing page, assembled from `components/landing/`:
  `landing-nav.tsx`, `hero-section.tsx`, `animated-network-background.tsx`
  (abstract decorative SVG — not real geography), `stats-section.tsx` +
  `stat-item.tsx` (count-up animation via `hooks/use-count-up.ts`),
  `features-section.tsx`, `roadmap-section.tsx`, `footer-section.tsx`.
- Dashboard IA redesigned in `constants/navigation.ts`: **Overview, Network,
  Stations, Routes, Trips** (Platform group), **Analytics, Simulation, AI
  Lab** (Intelligence group), **Settings, Documentation, GitHub** (System
  group). Every sidebar entry resolves to a real route.
- `components/dashboard/stat-card.tsx` and `chart-placeholder.tsx` — the
  house style for "architecture-ready, zero fabricated data" surfaces. KPI
  cards always render `—` with a connection-status badge; charts render an
  inert axis grid with a "no data" overlay. Reused across Overview and
  Analytics rather than re-implemented per page.
- `components/layout/breadcrumb.tsx` — derives labels from
  `constants/navigation.ts`, added to `Topbar`.
- `components/map/` (the Metro Map architecture, prepared with **no map
  library and no fabricated coordinates**): `map-context.tsx` (MapContext +
  MapProvider — layers, zoom, engine status), `map-canvas.tsx` (inert
  placeholder surface), `map-toolbar.tsx`, `map-legend.tsx`,
  `layer-control.tsx`, `zoom-control.tsx`, `map-status.tsx`.
  `hooks/use-map.ts` exposes granular selector hooks (MapHooks) over
  `MapContext`. `services/map/map-utils.ts` holds pure helpers (MapUtils);
  `types/map.ts` holds the domain types. The Network page
  (`app/(dashboard)/dashboard/network/`) composes all of these — swap in a
  real map renderer inside `MapCanvas` and everything else keeps working.
- `components/dashboard/explorer-toolbar.tsx` and `line-legend.tsx` — shared
  by the Stations and Routes pages, which ship as fully designed empty
  states (search/filter UI live, data grid empty) rather than with invented
  station or route data.
- `components/dashboard/prediction-card.tsx` + `constants/ai-predictions.ts`
  — the AI Lab's four prediction modules (ETA, Delay Detection, Crowding,
  Passenger Flow), each explicitly labeled "Model not trained".
- Network-scale figures on the landing page (`constants/stats.ts`) are the
  literal figures supplied in the project brief, not fabricated GTFS data —
  everything downstream of that (dashboard KPIs, charts, explorers) stays at
  zero until a real engine is connected.

## Milestone 2 additions (application shell)

- `components/layout/` — `app-shell.tsx` (composition root), `sidebar.tsx`,
  `topbar.tsx`, `mobile-nav.tsx`, `nav-item.tsx` (shared between sidebar and
  mobile nav — no duplicated navigation markup), `command-palette.tsx`,
  `theme-toggle.tsx`, `notification-menu.tsx`, `profile-menu.tsx`,
  `clock-display.tsx`, `connection-status.tsx`, `search-trigger.tsx`,
  `right-panel.tsx`.
- `components/ui/` gained `badge.tsx`, `tabs.tsx`, `dropdown-menu.tsx`,
  `tooltip.tsx`, `sheet.tsx`, `command.tsx` — all framework-agnostic and
  reusable by future engines' own UI.
- `hooks/use-app-shell.tsx` — single context for sidebar collapse, mobile
  drawer, right panel, and command palette state, avoiding prop drilling
  through the shell.
- `hooks/use-keyboard-shortcut.ts` — generic shortcut binding, used today for
  ⌘K and reusable for any future shortcut.
- `hooks/use-mounted.ts` — hydration-safe guard used by the clock and theme
  toggle so server/client markup never mismatches.
- `constants/navigation.ts` — the single source of truth for sidebar, mobile
  nav, and command palette entries. Adding a route means editing one array,
  not three components.
- `app/(dashboard)/` — route group mounting `AppShell` once around every
  dashboard route, so no navigation link is ever dead.
- Theme tokens ship both light and dark variants (`:root` / `.dark` in
  `styles/globals.css`) since Milestone 2 requires Dark, Light, and System
  modes; System resolves via `next-themes` and preference persists
  automatically in `localStorage`.
