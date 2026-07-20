import type { RealtimeVehicle } from "@/types/realtime";

function formatTimestamp(ms: number | null): string {
  if (ms === null) return "Not reported";
  return new Date(ms).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatOptionalNumber(value: number | null, unit: string): string {
  return value === null ? "Not reported" : `${value.toFixed(1)} ${unit}`;
}

export interface VehiclePopupProps {
  vehicle: RealtimeVehicle;
}

/** Every field here is read straight from the feed; anything the feed omits reads "Not reported". */
export function VehiclePopup({ vehicle }: VehiclePopupProps) {
  return (
    <div style={{ minWidth: 200, fontFamily: "var(--font-mono, monospace)", fontSize: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
        {vehicle.vehicle.label ?? vehicle.vehicle.id ?? vehicle.entityId}
      </div>
      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 8px", margin: 0 }}>
        <dt style={{ opacity: 0.6 }}>Trip ID</dt>
        <dd style={{ margin: 0 }}>{vehicle.trip.tripId ?? "Not reported"}</dd>

        <dt style={{ opacity: 0.6 }}>Route ID</dt>
        <dd style={{ margin: 0 }}>{vehicle.trip.routeId ?? "Not reported"}</dd>

        <dt style={{ opacity: 0.6 }}>Timestamp</dt>
        <dd style={{ margin: 0 }}>{formatTimestamp(vehicle.timestampMs)}</dd>

        <dt style={{ opacity: 0.6 }}>Latitude</dt>
        <dd style={{ margin: 0 }}>{vehicle.position.lat.toFixed(6)}</dd>

        <dt style={{ opacity: 0.6 }}>Longitude</dt>
        <dd style={{ margin: 0 }}>{vehicle.position.lon.toFixed(6)}</dd>

        <dt style={{ opacity: 0.6 }}>Bearing</dt>
        <dd style={{ margin: 0 }}>
          {vehicle.position.bearing === null ? "Not reported" : `${vehicle.position.bearing.toFixed(0)}°`}
        </dd>

        <dt style={{ opacity: 0.6 }}>Speed</dt>
        <dd style={{ margin: 0 }}>{formatOptionalNumber(vehicle.position.speed, "m/s")}</dd>

        <dt style={{ opacity: 0.6 }}>Status</dt>
        <dd style={{ margin: 0 }}>{vehicle.currentStatus ?? "Not reported"}</dd>
      </dl>
    </div>
  );
}
