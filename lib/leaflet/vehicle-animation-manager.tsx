import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

import { VehiclePopup } from "@/components/map/vehicle-popup";
import { getVehicleIcon } from "@/lib/leaflet/vehicle-icon";
import type { RealtimeVehicle } from "@/types/realtime";

const ANIMATION_DURATION_MS = 1_200;

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

interface TrackedMarker {
  marker: L.Marker;
  vehicle: RealtimeVehicle;
  animationFrame: number | null;
}

export interface VehicleAnimationManagerOptions {
  onSelect?: (entityId: string) => void;
}

/**
 * Owns a Leaflet LayerGroup of vehicle markers directly (bypassing
 * react-leaflet's declarative reconciliation, which doesn't scale cleanly
 * to several thousand markers refreshed every poll). `sync()` diffs the
 * incoming snapshot against tracked markers: unseen vehicles get a new
 * marker, vanished vehicles get removed, and vehicles whose position moved
 * are eased to their new location over `ANIMATION_DURATION_MS` rather than
 * teleporting.
 */
export class VehicleAnimationManager {
  private map: L.Map | null = null;
  private readonly layerGroup = L.layerGroup();
  private readonly markers = new Map<string, TrackedMarker>();
  private selectedId: string | null = null;
  private readonly options: VehicleAnimationManagerOptions;
  /** Milestone 8 Prediction Overlay: vehicleId -> real congestion-level
   * color, set via `setCongestionColors()`. Empty when the overlay is off. */
  private congestionByVehicleId: Map<string, string> = new Map();

  constructor(options: VehicleAnimationManagerOptions = {}) {
    this.options = options;
  }

  attach(map: L.Map): void {
    this.map = map;
    this.layerGroup.addTo(map);
  }

  detach(): void {
    for (const tracked of this.markers.values()) {
      if (tracked.animationFrame !== null) cancelAnimationFrame(tracked.animationFrame);
    }
    this.markers.clear();
    this.layerGroup.clearLayers();
    this.layerGroup.remove();
    this.map = null;
  }

  setSelected(entityId: string | null): void {
    const previous = this.selectedId;
    this.selectedId = entityId;
    if (previous) this.refreshIcon(previous);
    if (entityId) this.refreshIcon(entityId);
  }

  /** Milestone 8: applies (or clears, if `colors` is empty) a real
   * per-vehicle congestion color from the Prediction Engine to every
   * currently tracked marker. Safe to call independently of `sync()`. */
  setCongestionColors(colorsByVehicleId: Map<string, string>): void {
    this.congestionByVehicleId = colorsByVehicleId;
    for (const [entityId] of this.markers) {
      this.refreshIcon(entityId);
    }
  }

  private refreshIcon(entityId: string): void {
    const tracked = this.markers.get(entityId);
    if (!tracked) return;
    tracked.marker.setIcon(
      getVehicleIcon(
        tracked.vehicle.position.bearing,
        entityId === this.selectedId,
        this.congestionByVehicleId.get(entityId),
      ),
    );
  }

  /** Diffs `vehicles` against currently tracked markers and applies the minimal set of changes. */
  sync(vehicles: RealtimeVehicle[]): void {
    if (!this.map) return;

    const incomingIds = new Set(vehicles.map((v) => v.entityId));
    for (const [id, tracked] of this.markers) {
      if (incomingIds.has(id)) continue;
      if (tracked.animationFrame !== null) cancelAnimationFrame(tracked.animationFrame);
      this.layerGroup.removeLayer(tracked.marker);
      this.markers.delete(id);
    }

    for (const vehicle of vehicles) {
      const existing = this.markers.get(vehicle.entityId);
      if (existing) {
        this.updateMarker(existing, vehicle);
      } else {
        this.createMarker(vehicle);
      }
    }
  }

  private openPopupFor(entityId: string): void {
    const tracked = this.markers.get(entityId);
    if (!tracked || !this.map) return;
    const html = renderToStaticMarkup(<VehiclePopup vehicle={tracked.vehicle} />);
    L.popup({ closeButton: true }).setLatLng(tracked.marker.getLatLng()).setContent(html).openOn(this.map);
  }

  private createMarker(vehicle: RealtimeVehicle): void {
    const marker = L.marker([vehicle.position.lat, vehicle.position.lon], {
      icon: getVehicleIcon(
        vehicle.position.bearing,
        vehicle.entityId === this.selectedId,
        this.congestionByVehicleId.get(vehicle.entityId),
      ),
      keyboard: false,
    });

    marker.bindTooltip(vehicle.vehicle.label ?? vehicle.vehicle.id ?? vehicle.entityId, {
      direction: "top",
      offset: [0, -8],
    });

    marker.on("click", () => {
      this.options.onSelect?.(vehicle.entityId);
      this.openPopupFor(vehicle.entityId);
    });

    marker.addTo(this.layerGroup);
    this.markers.set(vehicle.entityId, { marker, vehicle, animationFrame: null });
  }

  private updateMarker(tracked: TrackedMarker, vehicle: RealtimeVehicle): void {
    const from = tracked.marker.getLatLng();
    const to = L.latLng(vehicle.position.lat, vehicle.position.lon);
    tracked.vehicle = vehicle;

    if (tracked.animationFrame !== null) {
      cancelAnimationFrame(tracked.animationFrame);
      tracked.animationFrame = null;
    }

    tracked.marker.setIcon(
      getVehicleIcon(
        vehicle.position.bearing,
        vehicle.entityId === this.selectedId,
        this.congestionByVehicleId.get(vehicle.entityId),
      ),
    );

    if (from.equals(to)) return;

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = Math.min(1, (now - start) / ANIMATION_DURATION_MS);
      const eased = easeInOutQuad(elapsed);
      tracked.marker.setLatLng([from.lat + (to.lat - from.lat) * eased, from.lng + (to.lng - from.lng) * eased]);

      if (elapsed < 1) {
        tracked.animationFrame = requestAnimationFrame(step);
      } else {
        tracked.animationFrame = null;
      }
    };
    tracked.animationFrame = requestAnimationFrame(step);
  }
}
