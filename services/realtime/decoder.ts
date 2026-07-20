import "server-only";

import GtfsRealtimeBindings from "gtfs-realtime-bindings";

import { OtdFeedError } from "@/services/realtime/otd-feed-client";

export type DecodedFeedMessage = InstanceType<
  typeof GtfsRealtimeBindings.transit_realtime.FeedMessage
>;

/**
 * Decodes raw VehiclePositions.pb bytes into a `transit_realtime.FeedMessage`
 * using the official `gtfs-realtime-bindings` package (protobufjs-generated
 * from Google's canonical .proto schema) — never a hand-rolled parser.
 */
export function decodeVehiclePositions(bytes: Uint8Array): DecodedFeedMessage {
  try {
    return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown protobuf decode error";
    throw new OtdFeedError("invalid-protobuf", `Failed to decode GTFS-Realtime feed: ${message}`);
  }
}
