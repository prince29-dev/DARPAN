"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";

export interface NavLinkProps {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavLink({ item, collapsed = false, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = !item.external && pathname === item.href;
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
        isActive && "bg-surface-elevated text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className={cn("size-4 shrink-0", isActive && "text-accent")} strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.external && (
        <ExternalLink className="ml-auto size-3.5 text-muted-foreground/60" />
      )}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
          {item.badge}
        </span>
      )}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
