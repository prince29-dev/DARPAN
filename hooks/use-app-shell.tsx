"use client";

import * as React from "react";

interface AppShellContextValue {
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

  const value = React.useMemo<AppShellContextValue>(
    () => ({
      sidebarCollapsed,
      toggleSidebarCollapsed: () => setSidebarCollapsed((prev) => !prev),
      mobileNavOpen,
      setMobileNavOpen,
      rightPanelOpen,
      toggleRightPanel: () => setRightPanelOpen((prev) => !prev),
      commandPaletteOpen,
      setCommandPaletteOpen,
    }),
    [sidebarCollapsed, mobileNavOpen, rightPanelOpen, commandPaletteOpen],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellContextValue {
  const context = React.useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an AppShellProvider");
  }
  return context;
}
