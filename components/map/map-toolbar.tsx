"use client";

import { Layers, Maximize } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface MapToolbarProps {
  layersOpen: boolean;
  onToggleLayers: () => void;
}

export function MapToolbar({ layersOpen, onToggleLayers }: MapToolbarProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-elevated p-2 shadow-lg">
      <Button
        type="button"
        variant={layersOpen ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={layersOpen}
        aria-label="Toggle layers panel"
        onClick={onToggleLayers}
      >
        <Layers className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Fullscreen" disabled>
        <Maximize className="size-4" />
      </Button>
    </div>
  );
}
