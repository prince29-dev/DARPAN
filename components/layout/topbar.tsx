"use client";

import { Menu, PanelRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ClockDisplay } from "@/components/layout/clock-display";
import { ConnectionStatus } from "@/components/layout/connection-status";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAppShell } from "@/hooks/use-app-shell";

export function Topbar() {
  const { setMobileNavOpen, toggleRightPanel } = useAppShell();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        className="text-muted-foreground lg:hidden"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-4" />
      </Button>

      <Breadcrumb />

      <SearchTrigger className="max-w-xs flex-1 lg:ml-4 lg:flex-none" />

      <Badge variant="outline" className="hidden md:inline-flex">
        Development
      </Badge>

      <div className="hidden items-center gap-4 md:flex">
        <ConnectionStatus showTimestamp />
        <ClockDisplay />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:ml-0">
        <ThemeToggle />
        <NotificationMenu />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle inspector panel"
          className="text-muted-foreground hover:text-foreground"
          onClick={toggleRightPanel}
        >
          <PanelRight className="size-4" />
        </Button>
        <div className="ml-1 border-l border-border pl-2">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
