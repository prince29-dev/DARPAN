"use client";

import { Radar } from "lucide-react";

import { NavLink } from "@/components/layout/nav-item";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NAV_GROUPS } from "@/constants/navigation";
import { useAppShell } from "@/hooks/use-app-shell";

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useAppShell();

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent title="Navigation" side="left" className="flex flex-col p-0">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
          <span className="relative flex size-3.5 shrink-0">
            <span className="absolute inline-flex size-full animate-signal-pulse rounded-full bg-accent" />
            <Radar className="relative size-3.5 text-accent" strokeWidth={2} />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">DARPAN</span>
          <Badge variant="outline">v0.1</Badge>
        </div>

        <nav aria-label="Primary" className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="px-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
