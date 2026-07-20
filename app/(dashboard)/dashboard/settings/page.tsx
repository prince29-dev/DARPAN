import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/coming-soon";
import { PredictionStatusCard } from "@/components/dashboard/prediction-status-card";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Workspace, account, and platform configuration arrive in a later milestone.
        </p>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Prediction Engine
        </h2>
        <PredictionStatusCard variant="compact" className="max-w-md" />
      </div>

      <ComingSoon
        icon={Settings}
        title="More settings coming soon"
        description="Workspace, account, and platform configuration arrive in a later milestone."
      />
    </div>
  );
}
