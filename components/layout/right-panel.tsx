"use client";

import { motion } from "framer-motion";
import {
  Bell as BellIcon,
  ScrollText,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppShell } from "@/hooks/use-app-shell";

const PANEL_WIDTH = 320;

export function RightPanel() {
  const { rightPanelOpen, toggleRightPanel } = useAppShell();

  return (
    <motion.aside
      initial={false}
      animate={{ width: rightPanelOpen ? PANEL_WIDTH : 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden shrink-0 overflow-hidden border-l border-border bg-surface xl:block"
    >
      <div className="flex h-full w-80 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <span className="font-display text-sm font-semibold">Inspector</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close inspector panel"
            onClick={toggleRightPanel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="logs">
            <TabsList className="w-full">
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="notifications">Alerts</TabsTrigger>
              <TabsTrigger value="inspector">Inspect</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>

            <TabsContent value="logs">
              <EmptyState
                icon={ScrollText}
                title="No logs yet"
                description="System and engine logs will stream here once the Realtime Engine is connected."
              />
            </TabsContent>

            <TabsContent value="notifications">
              <EmptyState
                icon={BellIcon}
                title="No alerts"
                description="Operational alerts will surface here as engines come online."
              />
            </TabsContent>

            <TabsContent value="inspector">
              <EmptyState
                icon={SlidersHorizontal}
                title="Nothing selected"
                description="Select a station, route, or train on the map to inspect it here."
              />
            </TabsContent>

            <TabsContent value="ai">
              <EmptyState
                icon={Sparkles}
                title="AI Engine offline"
                description="Predictive insights and assistant responses will appear here."
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.aside>
  );
}
