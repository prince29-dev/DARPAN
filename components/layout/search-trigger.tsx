"use client";

import { Search } from "lucide-react";

import { useAppShell } from "@/hooks/use-app-shell";
import { cn } from "@/lib/utils";

export function SearchTrigger({ className }: { className?: string }) {
  const { setCommandPaletteOpen } = useAppShell();

  return (
    <button
      type="button"
      onClick={() => setCommandPaletteOpen(true)}
      className={cn(
        "flex h-9 w-full max-w-xs items-center gap-2.5 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground",
        className,
      )}
    >
      <Search className="size-4 shrink-0" />
      <span className="truncate">Search DARPAN…</span>
      <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}
