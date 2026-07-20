import "server-only";

import GtfsRealtimeBindings from "gtfs-realtime-bindings";

import type { DecodedFeedMessage } from "@/services/realtime/decoder";
import type {
  FeedHeader,
  GtfsRealtimeIncrementality,
  RealtimeVehicle,
  TripDescriptor,
  TripScheduleRelationship,
  VehicleDescriptor,
  VehiclePositionPoint,
  VehicleStopStatus,
} from "@/types/realtime";

const { transit_realtime } = GtfsRealtimeBindings;

type LongLike = { toNumber(): number };

function isLongLike(value: unknown): value is LongLike {
  return typeof value === "object" && value !== null && typeof (value as LongLike).toNumber === "function";
}

/** protobufjs represents 64-bit ints as `number | Long` depending on runtime config. */
function toEpochMs(value: number | LongLike | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const seconds = isLongLike(value) ? value.toNumber() : value;
  return seconds * 1000;
}

const INCREMENTALITY_LABEL: Record<number, GtfsRealtimeIncrementality> = {
  [transit_realtime.FeedHeader.Incrementality.FULL_DATASET]: "FULL_DATASET",
  [transit_realtime.FeedHeader.Incrementality.DIFFERENTIAL]: "DIFFERENTIAL",
};

const SCHEDULE_RELATIONSHIP_LABEL: Record<number, TripScheduleRelationship> = {
  [transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED]: "SCHEDULED",
  [transit_realtime.TripDescriptor.ScheduleRelationship.ADDED]: "ADDED",
  [transit_realtime.TripDescriptor.ScheduleRelationship.UNSCHEDULED]: "UNSCHEDULED",
  [transit_realtime.TripDescriptor.ScheduleRelationship.CANCELED]: "CANCELED",
  [transit_realtime.TripDescriptor.ScheduleRelationship.REPLACEMENT]: "REPLACEMENT",
  [transit_realtime.TripDescriptor.ScheduleRelationship.DUPLICATED]: "DUPLICATED",
  [transit_realtime.TripDescriptor.ScheduleRelationship.DELETED]: "DELETED",
  [transit_realtime.TripDescriptor.ScheduleRelationship.NEW]: "NEW",
};

const STOP_STATUS_LABEL: Record<number, VehicleStopStatus> = {
  [transit_realtime.VehiclePosition.VehicleStopStatus.INCOMING_AT]: "INCOMING_AT",
  [transit_realtime.VehiclePosition.VehicleStopStatus.STOPPED_AT]: "STOPPED_AT",
  [transit_realtime.VehiclePosition.VehicleStopStatus.IN_TRANSIT_TO]: "IN_TRANSIT_TO",
};

type TripDescriptorEntity = GtfsRealtimeBindings.transit_realtime.ITripDescriptor;
type VehicleDescriptorEntity = GtfsRealtimeBindings.transit_realtime.IVehicleDescriptor;
type PositionEntity = GtfsRealtimeBindings.transit_realtime.IPosition;

/**
 * protobufjs only assigns a field as the decoded message instance's *own*
 * property when the wire actually contained it; unset proto3 scalar
 * fields fall through to a prototype-level zero-value (0, "", etc.) that
 * is indistinguishable from a real zero via plain property access. Using
 * `hasOwnProperty` here is the difference between correctly reporting
 * "bearing not reported" and fabricating "bearing: 0" for a feed that
 * never sent bearing at all — confirmed against the real OTD sample,
 * where `bearing`/`odometer`/`currentStatus`/`stopId`/`currentStopSequence`
 * /`licensePlate`/`directionId` are absent on every entity.
 */
function presentOrNull<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
): Exclude<T[K], undefined> | null {
  if (!obj || !Object.prototype.hasOwnProperty.call(obj, key)) return null;
  return obj[key] as Exclude<T[K], undefined>;
}

function normalizeHeader(header: DecodedFeedMessage["header"]): FeedHeader {
  return {
    gtfsRealtimeVersion: header.gtfsRealtimeVersion,
    incrementality: INCREMENTALITY_LABEL[header.incrementality ?? 0] ?? "FULL_DATASET",
    timestampMs: toEpochMs(header.timestamp) ?? Date.now(),
  };
}

function normalizeTrip(trip: TripDescriptorEntity | null | undefined): TripDescriptor {
  const scheduleRelationship = presentOrNull(trip, "scheduleRelationship");
  return {
    tripId: presentOrNull(trip, "tripId"),
    routeId: presentOrNull(trip, "routeId"),
    directionId: presentOrNull(trip, "directionId"),
    startTime: presentOrNull(trip, "startTime"),
    startDate: presentOrNull(trip, "startDate"),
    scheduleRelationship:
      scheduleRelationship != null ? (SCHEDULE_RELATIONSHIP_LABEL[scheduleRelationship] ?? null) : null,
  };
}

function normalizeVehicleDescriptor(
  vehicle: VehicleDescriptorEntity | null | undefined,
): VehicleDescriptor {
  return {
    id: presentOrNull(vehicle, "id"),
    label: presentOrNull(vehicle, "label"),
    licensePlate: presentOrNull(vehicle, "licensePlate"),
  };
}

function normalizePosition(position: PositionEntity | null | undefined): VehiclePositionPoint | null {
  if (!position) return null;
  // latitude/longitude are required fields on the wire (no meaningful
  // "absent" case for a VehiclePosition we're choosing to render at all).
  return {
    lat: position.latitude ?? 0,
    lon: position.longitude ?? 0,
    bearing: presentOrNull(position, "bearing"),
    odometer: presentOrNull(position, "odometer"),
    speed: presentOrNull(position, "speed"),
  };
}

export interface NormalizedFeed {
  header: FeedHeader;
  vehicles: RealtimeVehicle[];
  rawEntityCount: number;
}

/**
 * Flattens a decoded FeedMessage into our RealtimeVehicle[] shape.
 * Entities without a `vehicle` payload or without a position are skipped
 * (GTFS-rt allows position-less vehicle updates, but this app has nothing
 * useful to render for them) — `rawEntityCount` still reflects the true
 * total for the debug panel.
 */
export function normalizeFeed(feed: DecodedFeedMessage): NormalizedFeed {
  const vehicles: RealtimeVehicle[] = [];

  for (const entity of feed.entity) {
    if (!entity.vehicle || !entity.vehicle.position) continue;

    const currentStatus = presentOrNull(entity.vehicle, "currentStatus");

    vehicles.push({
      entityId: entity.id,
      vehicle: normalizeVehicleDescriptor(entity.vehicle.vehicle),
      trip: normalizeTrip(entity.vehicle.trip),
      position: normalizePosition(entity.vehicle.position) as VehiclePositionPoint,
      currentStatus: currentStatus != null ? (STOP_STATUS_LABEL[currentStatus] ?? null) : null,
      currentStopSequence: presentOrNull(entity.vehicle, "currentStopSequence"),
      stopId: presentOrNull(entity.vehicle, "stopId"),
      timestampMs: toEpochMs(entity.vehicle.timestamp),
    });
  }

  return {
    header: normalizeHeader(feed.header),
    vehicles,
    rawEntityCount: feed.entity.length,
  };
}
