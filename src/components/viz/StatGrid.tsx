import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "secondary" | "accent" | "warning";
}

export function StatGrid({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {items.map((s) => (
        <div key={s.label} className="glass rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            {s.label}
          </div>
          <div
            className={cn(
              "mt-1.5 font-display font-bold text-2xl tabular-nums",
              s.accent === "primary" && "text-primary",
              s.accent === "secondary" && "text-secondary",
              s.accent === "accent" && "text-accent",
              s.accent === "warning" && "text-warning",
            )}
          >
            {s.value}
          </div>
          {s.hint && <div className="text-[11px] text-muted-foreground mt-0.5">{s.hint}</div>}
        </div>
      ))}
    </div>
  );
}
