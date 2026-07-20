import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ChartPlaceholderProps {
  title: string;
  description: string;
  className?: string;
}

export function ChartPlaceholder({ title, description, className }: ChartPlaceholderProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className="relative mx-6 mb-6 h-48 overflow-hidden rounded-md border border-dashed border-border bg-surface">
        <svg
          className="absolute inset-0 size-full text-border"
          preserveAspectRatio="none"
          viewBox="0 0 400 160"
          aria-hidden="true"
        >
          {[32, 64, 96, 128].map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeWidth="1" />
          ))}
          {[0, 80, 160, 240, 320, 400].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="160" stroke="currentColor" strokeWidth="1" />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center bg-surface/70 backdrop-blur-[1px]">
          <span className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
            No data — engine not connected
          </span>
        </div>
      </div>
    </Card>
  );
}
