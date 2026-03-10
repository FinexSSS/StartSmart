import { TooltipProps } from "recharts";

export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl px-4 py-3 shadow-2xl border border-border bg-card/95 backdrop-blur-xl">
      {label && (
        <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name || entry.dataKey}:</span>
          <span className="font-semibold text-foreground ml-auto font-mono">
            {typeof entry.value === "number"
              ? entry.value >= 1000 ? `$${entry.value.toLocaleString()}` : `$${entry.value}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PieTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];

  return (
    <div className="rounded-xl px-4 py-3 shadow-2xl border border-border bg-card/95 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: entry.payload?.fill || entry.color }} />
        <span className="text-xs font-semibold text-foreground">{entry.name}</span>
      </div>
      <p className="text-sm font-bold text-foreground mt-1 font-mono">
        ${typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
      </p>
    </div>
  );
}
