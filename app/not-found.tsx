import { Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <EmptyState
        icon={Compass}
        title="This route doesn't exist"
        description="The page you're looking for has moved or was never mapped."
        action={
          <Button asChild size="sm">
            <Link href="/">Back to DARPAN</Link>
          </Button>
        }
      />
    </main>
  );
}
