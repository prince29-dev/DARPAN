"use client";

import type { ReactNode } from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightPanel } from "@/components/layout/right-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { RealtimeDebugPanel } from "@/components/dashboard/realtime-debug-panel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShellProvider } from "@/hooks/use-app-shell";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppShellProvider>
      <TooltipProvider delayDuration={200}>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <MobileNav />

          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <div className="flex flex-1 overflow-hidden">
              <main className="scrollbar-thin flex-1 overflow-y-auto">{children}</main>
              <RightPanel />
            </div>
          </div>

          <CommandPalette />
          <RealtimeDebugPanel />
        </div>
      </TooltipProvider>
    </AppShellProvider>
  );
}
