"use client";

import * as React from "react";

interface KeyboardShortcutOptions {
  key: string;
  metaOrCtrl?: boolean;
  onTrigger: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcut({
  key,
  metaOrCtrl = false,
  onTrigger,
  enabled = true,
}: KeyboardShortcutOptions): void {
  React.useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent): void {
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesModifier = metaOrCtrl ? event.metaKey || event.ctrlKey : true;

      if (matchesKey && matchesModifier) {
        event.preventDefault();
        onTrigger();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, metaOrCtrl, onTrigger, enabled]);
}
