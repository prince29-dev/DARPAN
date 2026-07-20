import { BookOpen } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "Documentation" };

export default function DocumentationPage() {
  return (
    <ComingSoon
      icon={BookOpen}
      title="Documentation"
      description="Architecture guides and engine references will be published here as each milestone ships."
    />
  );
}
