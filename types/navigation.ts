import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  external?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
