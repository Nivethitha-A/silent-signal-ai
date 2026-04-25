import { cn } from "@/lib/utils";

interface Props {
  lines: string[];
  activeLine?: number;
  className?: string;
}

export function CodePanel({ lines, activeLine, className }: Props) {
  return (
    <div className={cn("glass rounded-xl overflow-hidden", className)}>
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/50">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">pseudocode</span>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto scroll-thin">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "px-2 py-0.5 rounded transition-colors duration-200 flex gap-3",
              i === activeLine && "bg-primary/15 text-foreground",
            )}
          >
            <span className="text-muted-foreground/60 select-none w-5 text-right">{i + 1}</span>
            <span className={cn(i === activeLine ? "text-primary-glow font-semibold" : "text-foreground/85")}>
              {line || " "}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}
