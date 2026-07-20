"use client";

import { Minus, Plus } from "lucide-react";

import { useMapZoom } from "@/hooks/use-map";
import { MAX_ZOOM, MIN_ZOOM } from "@/services/map/map-utils";

export function ZoomControl() {
  const { zoom, zoomIn, zoomOut } = useMapZoom();

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface-elevated shadow-lg">
      <button
        type="button"
        onClick={zoomIn}
        disabled={zoom >= MAX_ZOOM}
        aria-label="Zoom in"
        className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
      <div className="border-y border-border py-1 text-center font-mono text-[10px] text-muted-foreground">
        {zoom}
      </div>
      <button
        type="button"
        onClick={zoomOut}
        disabled={zoom <= MIN_ZOOM}
        aria-label="Zoom out"
        className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
    </div>
  );
}
