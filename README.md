# DARPAN

**D**igital **A**I **R**epresentation of **P**ublic Transit **A**nalytics **N**etwork

An open-source AI-powered digital twin platform for public transportation.
Phase 1 target: Delhi Metro. Architected to extend to buses, airports,
railways, and full urban digital twins.

This repository currently contains **Milestone 1 — Foundation & Design
System**, **Milestone 2 — Application Shell**, **Milestone 3 — Landing Page
& Enterprise Dashboard**, **Milestone 4 — GTFS Engine**, **Milestone 5 —
Real Metro Map Engine**, and **Milestone 6 — Realtime GTFS-Realtime
Engine**. See `docs/ARCHITECTURE.md` for folder responsibilities and the
full milestone sequence.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui conventions (Radix primitives underneath)
- Framer Motion, Lucide Icons
- cmdk (command palette)
- React Hook Form + Zod
- next-themes (Dark / Light / System)
- A dependency-free GTFS parser (`services/gtfs/`) reading the real DMRC
  GTFS Static feed from `data/gtfs/`
- Leaflet + React Leaflet, OpenStreetMap tiles (`components/map/`,
  `lib/leaflet/`) — the real Digital Twin map, no Google Maps, no Mapbox key
- `gtfs-realtime-bindings` (official protobufjs-generated GTFS-Realtime
  decoder) + Zustand (`stores/`) — the live vehicle-position engine
- ESLint

## Data

`data/gtfs/` contains the DMRC (Delhi Metro Rail Corporation) GTFS Static
feed as supplied for this project. It's the only source of static transit
data in the app. If you redistribute this repository, confirm you have the
right to redistribute this dataset under its original terms.

## Realtime data

Milestone 6 connects to Delhi's Open Transit Data (OTD) GTFS-Realtime
`VehiclePositions.pb` feed — **a separate feed from a different agency
than the DMRC static data above**: it's Delhi's open bus-fleet feed
(confirmed by decoding a real sample — zero `trip_id` overlap with
`data/gtfs/trips.txt`, and a lat/lon spread reaching into Haryana/NCR).
Vehicles render as their own independent map layer with their own real
IDs, not joined to the metro network. See `docs/ARCHITECTURE.md` §
Milestone 6 for the full field-by-field writeup.

To enable it:

```bash
cp .env.example .env
```

Request a key at https://otd.delhi.gov.in and set `OTD_API_KEY` in `.env`.
The key is read only by `services/realtime/otd-feed-client.ts` on the
server — it has no `NEXT_PUBLIC_` prefix and is never sent to the browser.
Without a key, the Realtime Engine card on the dashboard and the top-nav
indicator show "Unauthorized" rather than crashing the app.

## Requirements

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```

Visit `http://localhost:3000` for the landing page (real network stats,
parsed live from GTFS), or `/dashboard` for the application shell. Press
`⌘K` / `Ctrl K` anywhere inside the dashboard to open the command palette.

## Other commands

```bash
npm run build      # production build
npm run start      # serve production build
npm run lint        # lint
npm run lint:fix    # lint and auto-fix
npm run typecheck   # strict TypeScript check, no emit
```

## What's in Milestone 4

- **GTFS Engine** (`services/gtfs/`) — parses the real DMRC GTFS Static feed
  shipped in `data/gtfs/` (`agency.txt`, `calendar.txt`, `routes.txt`,
  `stops.txt`, `trips.txt`, `stop_times.txt`, `shapes.txt`). No mock data,
  no hardcoded numbers, anywhere.
- **Overview** — Stations, Routes, Trips, and Stop Times counts are read
  live from the parsed feed (262 / 36 / 5,438 / 1,28,434 in the bundled
  dataset), each card marked "Connected".
- **Stations** — search 262 real stations by name; details panel shows the
  real station name, latitude, longitude, and station ID.
- **Routes** — all 36 real routes, each showing its real route name, route
  ID, and a trip count computed by counting `trips.txt` rows.
- **Trips** — all ~5,400 real trips, searchable by Trip ID, paginated.
- **Landing page stats** — now computed from the same GTFS Engine instead
  of hardcoded figures, so the marketing numbers can never drift from the
  data.
- Still not built (by design, per this milestone's scope): a real map
  renderer, any live/realtime API, and AI — `services/gtfs/shape.service.ts`
  and `types/shape.ts` exist and are ready, but nothing renders a map yet.
  (The map renderer above is Milestone 5, described next.)

## What's in Milestone 5

- **Network aggregation service** (`services/gtfs/network.service.ts`) —
  composes the existing `StationService`, `RouteService`, `ShapeService`,
  and `TripService` (plus the same `stop_times.txt` join `loader.ts`
  already parses) into a topology graph: which routes call at each
  station, which stations are interchanges or line termini, each route's
  ordered stop sequence and real GTFS shape geometry, and network-wide
  analytics (largest/smallest route, longest/shortest shape, average
  stops per trip). No new parsing, no fabricated data — every field
  traces back to a GTFS Engine service. `services/map/geo.ts` provides
  the pure haversine/bounds/polyline-length math; `services/map/
  route-colors.ts` documents the one presentation-layer decision this
  milestone makes (DMRC's feed leaves `route_color` blank, so lines get a
  deterministic palette color instead).
- **Real Leaflet map** (`components/map/leaflet-network-map.tsx`) — every
  real station and every real route shape renders on OpenStreetMap tiles.
  Dynamically imported with `ssr: false` from `MapCanvas` (Leaflet needs
  `window`), so the placeholder `MapCanvas` built in Milestone 3 now
  renders the live map exactly where the architecture doc said a real
  renderer would slot in, without the rest of the Network page changing.
- **Network page** (`/dashboard/network`) — rebuilt around
  `components/network/network-explorer.tsx`: a left panel (instant scoped
  search across stations/routes/trips, a per-line visibility filter, the
  map legend, and live network statistics), the interactive map in the
  center, and a right panel showing the real GTFS details of whatever is
  selected. `NetworkPage` itself is a Server Component that fetches from
  the GTFS Engine and network service directly, matching the
  Stations/Routes/Trips page pattern from Milestone 4.
- **Interaction** — click a station or line to select and highlight it and
  fly the map to it; hover for a tooltip; search results and "nearby
  stations" links do the same. `MapContext` (Milestone 3) is extended
  additively with selection/hover/fly-to state and a live engine-status
  reporter — none of its original zoom/layer API changed.
- Still not built (by design, per this milestone's scope): GTFS-Realtime,
  the Simulation engine, and AI prediction. `MapLayer` already has a
  `live-trains` layer id waiting for Milestone 6. (It's now built —
  renamed to `vehicles` once the real feed turned out to be buses, not
  trains; see Milestone 6 below.)

## What's in Milestone 6

- **Feed investigated before any code was written.** Decoded the real
  `VehiclePositions.pb` sample with `gtfs-realtime-bindings`: 5,356
  vehicles, 1,333 `route_id`s that don't match DMRC's 36, zero `trip_id`
  overlap with the static feed, and coordinates reaching well past the
  metro corridor into Haryana/NCR. It's Delhi's open bus-fleet feed, a
  different agency from DMRC — so vehicles are rendered as their own
  layer, never joined to `RouteService`/`StationService` by a fabricated
  ID match. Full writeup in `docs/ARCHITECTURE.md`.
- **Presence-correctness bug caught during verification, not shipped.**
  protobufjs fills unset proto3 scalar fields with their zero-value on
  the prototype, indistinguishable from a real `0` by plain property
  access. `services/realtime/normalize.ts` uses `hasOwnProperty` checks
  (`presentOrNull()`) so `bearing`, `odometer`, `currentStatus`, `stopId`,
  `currentStopSequence`, `licensePlate`, and `directionId` — all
  genuinely absent from every entity in the real feed — report `null`
  ("Not reported" in the UI) instead of a fabricated `0`/`""`. Verified
  against the real sample file with a standalone script, not just
  type-checked.
- **Server/browser split.** `OTD_API_KEY` (no `NEXT_PUBLIC_` prefix) is
  read only by `services/realtime/otd-feed-client.ts` on the server.
  `services/realtime/realtime.service.ts` fetches → decodes
  (`decoder.ts`) → normalizes (`normalize.ts`), with a 5s cache and
  in-flight request coalescing, and `app/api/realtime/vehicles/route.ts`
  exposes it as JSON with explicit 401/403/404/429/5xx/timeout handling.
  The browser only ever calls that same-origin route via
  `services/realtime/vehicle-feed-client.ts` — no key, no CORS, no
  protobuf in the client bundle.
- **Polling engine + store + hooks.** `services/realtime/polling-engine.ts`
  is a ref-counted singleton (default 15s interval, configurable),
  pauses on tab-hidden and resumes immediately on foreground, and backs
  off exponentially on failure. `stores/realtime-store.ts` (Zustand) is
  the single source of truth; `hooks/use-realtime.ts` exposes
  `useRealtime()`, `useVehicles()`, `useVehicle(id)`, and
  `useConnectionStatus()`.
- **Map integration at real scale.** `components/map/vehicle-layer.tsx` +
  `lib/leaflet/vehicle-animation-manager.tsx` manage Leaflet markers
  **imperatively** (bypassing react-leaflet's declarative reconciliation)
  so a 5,000+ vehicle poll never re-renders the map — positions ease to
  their new location via `requestAnimationFrame` instead of teleporting.
  Toggle the "Live Vehicles" layer in the Network page's layer control.
- **Dashboard, top nav, debug panel.** `components/dashboard/
  realtime-status-card.tsx` shows connection state, vehicle count, last
  update, latency, and a configurable polling interval.
  `components/layout/connection-status.tsx` (shared by the top nav and
  dashboard hero) shows a live indicator + last-refresh time.
  `components/dashboard/realtime-debug-panel.tsx` (development mode
  only) shows raw entity count, decoded count, response size, latency,
  polling countdown, and reconnect attempts.
- Still not built (by design): Simulation and AI prediction.

## What's in Milestone 3

- **Landing page** (`/`) — animated hero with an abstract network
  background, network-scale stats with count-up animation, six feature
  cards, a milestone roadmap timeline with an architecture blurb and
  research goals, and a full footer.
- **Dashboard redesigned** — information architecture: Overview, Network,
  Stations, Routes, Trips, Analytics, Simulation, AI Lab, Settings, with a
  breadcrumb in the top bar.
- **Metro Map architecture** (`/dashboard/network`) — `MapCanvas`,
  `MapToolbar`, `MapLegend`, `LayerControl`, `ZoomControl`, `MapProvider` /
  `MapContext`, `MapHooks`, `MapUtils` — fully modular, no map library.
- **AI Lab** — four prediction module cards, each explicitly labeled "Model
  not trained".
- **Analytics** — KPI cards and chart placeholders (unchanged this
  milestone — Analytics still awaits the Realtime/Analytics engines).

## What's in Milestone 2

- Application shell: collapsible desktop sidebar, mobile navigation drawer,
  top navigation bar, right utility panel (collapsed by default)
- Command palette (`⌘K` / `Ctrl K`) with keyboard navigation, wired to every
  route in the sidebar
- Theme switcher: Dark / Light / System, persisted via `next-themes`
- Notification and profile menu placeholders

## What's in Milestone 1

- Project configuration: TypeScript (strict), Tailwind, ESLint, Next config
- Design tokens (`constants/theme.ts`, `styles/globals.css`)
- Reusable primitives: `Button`, `Card`, `Modal`, `Section`
- System states: `LoadingScreen`, `EmptyState`, `ErrorBoundary`, route-level
  `loading.tsx`, `error.tsx`, `not-found.tsx`

Not yet built: a real map renderer, GTFS-Realtime, Simulation, and AI
engines. See `docs/ARCHITECTURE.md` for sequencing.
