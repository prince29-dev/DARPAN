"use client";

import { Check } from "lucide-react";

import { useNetworkData } from "@/components/network/network-data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NetworkLineFilterProps {
  hiddenRouteIds: ReadonlySet<string>;
  onToggle: (routeId: string) => void;
  onReset: () => void;
}

export function NetworkLineFilter({ hiddenRouteIds, onToggle, onReset }: NetworkLineFilterProps) {
  const { routes } = useNetworkData();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
          Lines ({routes.length})
        </p>
        {hiddenRouteIds.size > 0 && (
          <Button type="button" variant="link" size="sm" onClick={onReset} className="text-xs">
            Show all
          </Button>
        )}
      </div>

      <div className="scrollbar-thin flex max-h-48 flex-col gap-0.5 overflow-y-auto pr-1">
        {routes.map((route) => {
          const visible = !hiddenRouteIds.has(route.id);
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onToggle(route.id)}
              aria-pressed={visible}
              className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-elevated"
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded border",
                  visible ? "border-transparent" : "border-border",
                )}
                style={visible ? { backgroundColor: route.color } : undefined}
              >
                {visible && <Check className="size-3 text-white" strokeWidth={3} />}
              </span>
              <span className={cn("truncate", visible ? "text-foreground" : "text-muted-foreground")}>
                {route.longName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
