import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ALGORITHMS, AlgorithmId, benchmark } from "@/lib/algorithms";
import { bestCaseFor, worstCaseFor } from "@/lib/inputAnalyzer";
import { ArrayBars } from "@/components/viz/ArrayBars";
import { StatGrid } from "@/components/viz/StatGrid";

const SORTS: AlgorithmId[] = ["bubble", "selection", "insertion", "merge", "quick"];

const Cases = () => {
  const [algoId, setAlgoId] = useState<AlgorithmId>("quick");
  const [size, setSize] = useState(20);

  const algo = ALGORITHMS[algoId];
  const best = useMemo(() => bestCaseFor(algoId, size), [algoId, size]);
  const worst = useMemo(() => worstCaseFor(algoId, size), [algoId, size]);

  const bestStats = useMemo(() => benchmark(algoId, best.array), [algoId, best.array]);
  const worstStats = useMemo(() => benchmark(algoId, worst.array), [algoId, worst.array]);

  return (
    <div className="container py-8 pb-32 lg:pb-8 space-y-6 animate-fade-up">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
          Best & Worst Case Generator
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-1">
          See the <span className="aurora-text">extremes</span> of {algo.name}
        </h1>
      </header>

      <div className="glass rounded-2xl p-5 grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Algorithm</Label>
          <Select value={algoId} onValueChange={(v) => setAlgoId(v as AlgorithmId)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORTS.map((id) => (
                <SelectItem key={id} value={id}>{ALGORITHMS[id].name}</SelectItem>
              ))}
              <SelectItem value="binary-search">Binary Search</SelectItem>
              <SelectItem value="linear-search">Linear Search</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex justify-between">Size <span className="font-mono text-muted-foreground">{size}</span></Label>
          <Slider value={[size]} min={10} max={50} step={1} onValueChange={(v) => setSize(v[0])} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <CaseCard
          title="Best case"
          accent="success"
          complexity={algo.timeBest}
          array={best.array}
          stats={bestStats}
          explanation={best.explanation}
        />
        <CaseCard
          title="Worst case"
          accent="destructive"
          complexity={algo.timeWorst}
          array={worst.array}
          stats={worstStats}
          explanation={worst.explanation}
        />
      </div>

      <StatGrid
        items={[
          { label: "Worst / Best ratio (comp.)", value: bestStats.comparisons === 0 ? "∞" : (worstStats.comparisons / Math.max(1, bestStats.comparisons)).toFixed(2) + "×", accent: "warning" },
          { label: "Worst / Best ratio (steps)", value: bestStats.steps === 0 ? "∞" : (worstStats.steps / Math.max(1, bestStats.steps)).toFixed(2) + "×", accent: "secondary" },
          { label: "Best comparisons", value: bestStats.comparisons, accent: "primary" },
          { label: "Worst comparisons", value: worstStats.comparisons, accent: "accent" },
        ]}
      />
    </div>
  );
};

function CaseCard({
  title, accent, complexity, array, stats, explanation,
}: {
  title: string;
  accent: "success" | "destructive";
  complexity: string;
  array: number[];
  stats: { comparisons: number; swaps: number; durationMs: number; steps: number };
  explanation: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">{title}</h3>
        <Badge className={`${accent === "success" ? "bg-success/20 text-success border-success/40" : "bg-destructive/20 text-destructive border-destructive/40"} border font-mono`}>
          {complexity}
        </Badge>
      </div>
      <ArrayBars step={null} initialArray={array} className="h-40" />
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Cell label="Comparisons" value={stats.comparisons} />
        <Cell label="Swaps" value={stats.swaps} />
        <Cell label="Time (ms)" value={stats.durationMs.toFixed(2)} />
      </div>
      <p className="text-sm text-foreground/80">{explanation}</p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted/50 px-2 py-1.5">
      <div className="text-muted-foreground uppercase tracking-wider text-[9px]">{label}</div>
      <div className="font-mono font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export default Cases;
