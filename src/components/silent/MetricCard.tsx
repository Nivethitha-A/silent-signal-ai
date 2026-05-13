import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricResult } from "@/lib/silentSignal";
import { metricColor } from "@/lib/silentSignal";

interface Props { metric: MetricResult; }

export function MetricCard({ metric }: Props) {
  const color = metricColor(metric.key);
  const toneRing = metric.tone === "good"
    ? "ring-success/30"
    : metric.tone === "warn"
      ? "ring-warning/30"
      : "ring-destructive/30";

  const Icon = metric.trend > 0.5 ? ArrowUp : metric.trend < -0.5 ? ArrowDown : Minus;
  const trendCls = metric.trend > 0.5
    ? "text-warning"
    : metric.trend < -0.5
      ? "text-success"
      : "text-muted-foreground";

  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (metric.value / 100) * c;

  return (
    <div className={cn("glass rounded-2xl p-5 ring-1 transition hover:-translate-y-0.5 hover:shadow-elevated", toneRing)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums" style={{ color }}>
            {Math.round(metric.value)}<span className="text-base text-muted-foreground">%</span>
          </div>
          <div className={cn("mt-1 text-xs font-mono inline-flex items-center gap-1", trendCls)}>
            <Icon className="h-3 w-3" />
            {metric.trend > 0 ? "+" : ""}{metric.trend.toFixed(1)} vs last
          </div>
        </div>
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
            <circle
              cx="50" cy="50" r={r}
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${dash} ${c}`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
