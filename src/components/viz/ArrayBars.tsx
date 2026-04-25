import { useEffect, useMemo } from "react";
import type { Step } from "@/lib/algorithms";
import { cn } from "@/lib/utils";

interface Props {
  step: Step | null;
  initialArray: number[];
  className?: string;
}

/**
 * Animated bar chart for sorting algorithms.
 * Bar color reflects step.type + which indices are highlighted.
 */
export function ArrayBars({ step, initialArray, className }: Props) {
  const array = step?.array ?? initialArray;
  const max = useMemo(() => Math.max(...array, 1), [array]);
  const indices = step?.indices ?? [];

  const barClassFor = (i: number): string => {
    if (!step || !indices.includes(i)) return "bg-viz-default";
    switch (step.type) {
      case "compare": return "bg-viz-compare shadow-[0_0_18px_hsl(var(--viz-compare)/0.6)]";
      case "swap": return "bg-viz-swap shadow-[0_0_18px_hsl(var(--viz-swap)/0.6)]";
      case "overwrite": return "bg-viz-current shadow-[0_0_14px_hsl(var(--viz-current)/0.55)]";
      case "set-pivot": return "bg-viz-pivot shadow-[0_0_18px_hsl(var(--viz-pivot)/0.6)]";
      case "mark-sorted":
      case "done":
      case "found": return "bg-viz-sorted shadow-[0_0_18px_hsl(var(--viz-sorted)/0.55)]";
      case "highlight": return "bg-viz-current";
      case "not-found": return "bg-destructive";
      default: return "bg-viz-default";
    }
  };

  // After "done", paint everything sorted-green
  const allDone = step?.type === "done";

  return (
    <div className={cn("relative w-full h-72 sm:h-80 md:h-96 flex items-end gap-1 px-2", className)}>
      {array.map((v, i) => {
        const isHighlighted = indices.includes(i);
        const heightPct = (v / max) * 100;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t-md transition-all duration-200 ease-smooth relative",
              allDone ? "bg-viz-sorted shadow-[0_0_14px_hsl(var(--viz-sorted)/0.5)]" : barClassFor(i),
            )}
            style={{ height: `${Math.max(heightPct, 4)}%` }}
          >
            {array.length <= 30 && (
              <span
                className={cn(
                  "absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono tabular-nums",
                  isHighlighted ? "text-foreground font-semibold" : "text-muted-foreground",
                )}
              >
                {v}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
