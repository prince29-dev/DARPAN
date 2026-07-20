const LEGEND_ITEMS = [
  { label: "Station", swatchClassName: "bg-foreground" },
  { label: "Interchange", swatchClassName: "bg-accent" },
  { label: "Terminal", swatchClassName: "bg-signal" },
  { label: "Route line", swatchClassName: "bg-gradient-to-r from-accent to-signal" },
  { label: "Live vehicle", swatchClassName: "bg-signal" },
] as const;

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface-elevated px-4 py-2.5 shadow-lg">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`size-2.5 rounded-full ${item.swatchClassName}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
