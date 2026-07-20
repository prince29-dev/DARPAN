"use client";

import * as React from "react";

import type { NetworkAnalytics, NetworkRoute, NetworkStation } from "@/types/network";

interface NetworkDataContextValue {
  stations: NetworkStation[];
  routes: NetworkRoute[];
  analytics: NetworkAnalytics;
  stationById: Map<string, NetworkStation>;
  routeById: Map<string, NetworkRoute>;
}

const NetworkDataContext = React.createContext<NetworkDataContextValue | null>(null);

export interface NetworkDataProviderProps {
  stations: NetworkStation[];
  routes: NetworkRoute[];
  analytics: NetworkAnalytics;
  children: React.ReactNode;
}

export function NetworkDataProvider({
  stations,
  routes,
  analytics,
  children,
}: NetworkDataProviderProps) {
  const value = React.useMemo<NetworkDataContextValue>(
    () => ({
      stations,
      routes,
      analytics,
      stationById: new Map(stations.map((station) => [station.id, station])),
      routeById: new Map(routes.map((route) => [route.id, route])),
    }),
    [stations, routes, analytics],
  );

  return <NetworkDataContext.Provider value={value}>{children}</NetworkDataContext.Provider>;
}

export function useNetworkData(): NetworkDataContextValue {
  const context = React.useContext(NetworkDataContext);
  if (!context) {
    throw new Error("useNetworkData must be used within a NetworkDataProvider");
  }
  return context;
}
