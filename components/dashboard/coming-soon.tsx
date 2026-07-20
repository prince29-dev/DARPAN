import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";

export interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ComingSoon({ icon, title, description }: ComingSoonProps) {
  return (
    <div className="flex h-full items-center justify-center px-6 py-16">
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}
