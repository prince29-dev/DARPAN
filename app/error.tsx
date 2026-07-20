"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Intentionally left for future integration with an error-reporting service.
  }, [error]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10">
          <AlertTriangle className="size-6 text-destructive" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-xl font-semibold">DARPAN hit an error</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The platform ran into an unexpected problem. You can try again or head back
            to the homepage.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={reset}>
            Try again
          </Button>
          <Button asChild size="sm">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
