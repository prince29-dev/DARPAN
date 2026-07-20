"use client";

import * as React from "react";

import { useMounted } from "@/hooks/use-mounted";

export function ClockDisplay() {
  const mounted = useMounted();
  const [time, setTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !time) {
    return <span className="font-mono text-xs text-muted-foreground">--:--:--</span>;
  }

  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {time.toLocaleTimeString("en-IN", { hour12: false })}
    </span>
  );
}
