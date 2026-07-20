"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Radar } from "lucide-react";

import { NavLink } from "@/components/layout/nav-item";
import { Badge } from "@/components/ui/badge";
import { NAV_GROUPS } from "@/constants/navigation";
import { useAppShell } from "@/hooks/use-app-shell";
import { cn } from "@/lib/utils";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapsed } = useAppShell();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative hidden shrink-0 flex-col border-r border-border bg-surface lg:flex"
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 border-b border-border px-4",
          sidebarCollapsed && "justify-center px-0",
        )}
      >
        <span className="relative flex size-3.5 shrink-0">
          <span className="absolute inline-flex size-full animate-signal-pulse rounded-full bg-accent" />
          <Radar className="relative size-3.5 text-accent" strokeWidth={2} />
        </span>
        {!sidebarCollapsed && (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-sm font-semibold tracking-tight">
              DARPAN
            </span>
            <Badge variant="outline" className="shrink-0">
              v0.1
            </Badge>
          </div>
        )}
      </div>

      <nav
        aria-label="Primary"
        className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!sidebarCollapsed && (
              <p className="px-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-border p-3", sidebarCollapsed && "flex justify-center")}>
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
