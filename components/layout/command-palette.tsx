"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { NAV_GROUPS } from "@/constants/navigation";
import { useAppShell } from "@/hooks/use-app-shell";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppShell();
  const router = useRouter();

  useKeyboardShortcut({
    key: "k",
    metaOrCtrl: true,
    onTrigger: () => setCommandPaletteOpen(!commandPaletteOpen),
  });

  const runCommand = React.useCallback(
    (action: () => void) => {
      setCommandPaletteOpen(false);
      action();
    },
    [setCommandPaletteOpen],
  );

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Search DARPAN…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {NAV_GROUPS.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() =>
                  runCommand(() => {
                    if (item.external) {
                      window.open(item.href, "_blank", "noopener,noreferrer");
                    } else {
                      router.push(item.href);
                    }
                  })
                }
              >
                <item.icon className="size-4 text-muted-foreground" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Navigate DARPAN</span>
        <CommandShortcut>ESC to close</CommandShortcut>
      </div>
    </CommandDialog>
  );
}
