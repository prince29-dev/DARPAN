import { cn } from "@/lib/utils";

export interface LoadingScreenProps {
  label?: string;
  className?: string;
}

export function LoadingScreen({ label = "Loading DARPAN", className }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <span className="relative flex size-3">
        <span className="absolute inline-flex size-full animate-signal-pulse rounded-full bg-accent" />
        <span className="relative inline-flex size-3 rounded-full bg-accent" />
      </span>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
