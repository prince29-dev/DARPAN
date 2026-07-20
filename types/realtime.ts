/**
 * These mirror `transit_realtime.*` from `gtfs-realtime-bindings`, but as
 * plain, flattened, JSON-serializable shapes so the client never needs the
 * protobuf runtime. Every field here was confirmed present (or confirmed
 * absent and typed optional) by decoding a real VehiclePositions.pb sample
 * — see `docs/ARCHITECTURE.md` § Milestone 6 for the field inventory.
 */

export type GtfsRealtimeIncrementality = "FULL_DATASET" | "DIFFERENTIAL";

export interface FeedHeader {
  gtfsRealtimeVersion: string;
  incrementality: GtfsRealtimeIncrementality;
  /** Feed generation time, in epoch milliseconds. */
  timestampMs: number;
}

export type TripScheduleRelationship =
  | "SCHEDULED"
  | "ADDED"
  | "UNSCHEDULED"
  | "CANCELED"
  | "REPLACEMENT"
  | "DUPLICATED"
  | "DELETED"
  | "NEW";

export interface TripDescriptor {
  tripId: string | null;
  routeId: string | null;
  directionId: number | null;
  startTime: string | null;
  startDate: string | null;
  scheduleRelationship: TripScheduleRelationship | null;
}

export interface VehicleDescriptor {
  id: string | null;
  label: string | null;
  licensePlate: string | null;
}

export type VehicleStopStatus = "INCOMING_AT" | "STOPPED_AT" | "IN_TRANSIT_TO";

export interface VehiclePositionPoint {
  lat: number;
  lon: number;
  /** Compass bearing in degrees, 0–359. Not present in the current OTD feed. */
  bearing: number | null;
  /** Total accumulated distance in meters. Not present in the current OTD feed. */
  odometer: number | null;
  /** Meters/second, as reported by the feed. The current OTD feed always reports 0. */
  speed: number | null;
}

/** One decoded+normalized `VehiclePosition` FeedEntity — our "Vehicle". */
export interface RealtimeVehicle {
  /** FeedEntity.id — stable key for React/Leaflet marker identity. */
  entityId: string;
  vehicle: VehicleDescriptor;
  trip: TripDescriptor;
  position: VehiclePositionPoint;
  currentStatus: VehicleStopStatus | null;
  currentStopSequence: number | null;
  stopId: string | null;
  /** This vehicle record's own timestamp, epoch milliseconds. */
  timestampMs: number | null;
}

export interface RealtimeSnapshot {
  header: FeedHeader;
  vehicles: RealtimeVehicle[];
  /** Raw FeedEntity count before normalization/filtering — for the debug panel. */
  rawEntityCount: number;
  /** Size in bytes of the upstream .pb response — for the debug panel. */
  responseSizeBytes: number;
  /** When our server finished building this snapshot, epoch milliseconds. */
  fetchedAtMs: number;
  /** Upstream OTD round-trip latency, milliseconds. */
  upstreamLatencyMs: number;
}

export type RealtimeErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "rate-limited"
  | "server-error"
  | "invalid-protobuf"
  | "empty-feed"
  | "unknown";

export interface RealtimeError {
  kind: RealtimeErrorKind;
  message: string;
  httpStatus: number | null;
}

/**
 * High-level connection state, as named in the Milestone 6 brief. Kept
 * deliberately coarser than `RealtimeErrorKind` — the state drives status
 * copy in the UI, while the precise `RealtimeError` (with HTTP status)
 * still reaches the debug panel.
 */
export type ConnectionState =
  | "connecting"
  | "connected"
  | "retrying"
  | "offline"
  | "unauthorized"
  | "server-error";
