"use client";

import { Check } from "lucide-react";

import { useMapLayers } from "@/hooks/use-map";
import { cn } from "@/lib/utils";

export function LayerControl() {
  const { layers, toggleLayer } = useMapLayers();

  return (
    <div className="w-64 rounded-md border border-border bg-surface-elevated p-2 shadow-lg">
      <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
        Layers
      </p>
      <div className="flex flex-col gap-0.5">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => toggleLayer(layer.id)}
            aria-pressed={layer.enabled}
            className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface"
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded border",
                layer.enabled ? "border-accent bg-accent text-accent-foreground" : "border-border",
              )}
            >
              {layer.enabled && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className="flex flex-col">
              <span className="text-foreground">{layer.label}</span>
              <span className="text-xs text-muted-foreground">{layer.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
