import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ALGORITHMS, AlgorithmId, benchmark } from "@/lib/algorithms";
import { genRandom } from "@/lib/inputAnalyzer";
import { StatGrid } from "@/components/viz/StatGrid";
import { Checkbox } from "@/components/ui/checkbox";

const SORTS: AlgorithmId[] = ["bubble", "selection", "insertion", "merge", "quick"];

interface RunRow {
  size: number;
  [key: string]: number;
}

const Performance = () => {
  const [sizes, setSizes] = useState<number[]>([50, 100, 200, 400, 800]);
  const [maxSize, setMaxSize] = useState(800);
  const [enabled, setEnabled] = useState<Record<AlgorithmId, boolean>>({
    bubble: true, selection: true, insertion: true, merge: true, quick: true,
    "binary-search": false, "linear-search": false, bfs: false, dfs: false,
  });
  const [results, setResults] = useState<RunRow[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<Record<string, { time: number; comparisons: number; swaps: number }>>({});

  const algos = SORTS.filter((a) => enabled[a]);

  const run = async () => {
    setRunning(true);
    const stops = [50, 100, 200, 400, 800, 1500].filter((s) => s <= maxSize);
    setSizes(stops);
    const rows: RunRow[] = [];
    const sums: Record<string, { time: number; comparisons: number; swaps: number }> = {};
    for (const n of stops) {
      const arr = genRandom(n);
      const row: RunRow = { size: n };
      for (const id of algos) {
        const stats = benchmark(id, arr);
        row[`${id}_time`] = +stats.durationMs.toFixed(2);
        row[`${id}_comp`] = stats.comparisons;
        sums[id] = sums[id]
          ? { time: sums[id].time + stats.durationMs, comparisons: sums[id].comparisons + stats.comparisons, swaps: sums[id].swaps + stats.swaps }
          : { time: stats.durationMs, comparisons: stats.comparisons, swaps: stats.swaps };
      }
      rows.push(row);
      // yield to UI
      await new Promise((r) => setTimeout(r, 10));
    }
    setResults(rows);
    setSummary(sums);
    setRunning(false);
  };

  const COLORS: Record<string, string> = {
    bubble: "hsl(var(--viz-swap))",
    selection: "hsl(var(--warning))",
    insertion: "hsl(var(--viz-current))",
    merge: "hsl(var(--primary))",
    quick: "hsl(var(--secondary))",
  };

  const totalRuns = results.length * algos.length;
  const fastest = useMemo(() => {
    const last = results[results.length - 1];
    if (!last) return null;
    let best: { id: string; t: number } | null = null;
    for (const id of algos) {
      const t = last[`${id}_time`] as number;
      if (!best || t < best.t) best = { id, t };
    }
    return best;
  }, [results, algos]);

  return (
    <div className="container py-8 pb-32 lg:pb-8 space-y-6 animate-fade-up">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
          Performance Analysis Engine
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-1">
          Benchmark <span className="aurora-text">runtime & operations</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Run algorithms across multiple input sizes and visualize how runtime scales.
        </p>
      </header>

      <div className="glass rounded-2xl p-5 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs flex justify-between">
              Max input size <span className="font-mono text-muted-foreground">{maxSize}</span>
            </Label>
            <Slider value={[maxSize]} min={200} max={1500} step={100} onValueChange={(v) => setMaxSize(v[0])} />
            <p className="text-[11px] text-muted-foreground">
              Tip: stop at 800 if Bubble/Selection feel sluggish.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Algorithms</Label>
            <div className="flex flex-wrap gap-3">
              {SORTS.map((id) => (
                <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={enabled[id]}
                    onCheckedChange={(c) => setEnabled((e) => ({ ...e, [id]: !!c }))}
                  />
                  <span className="font-medium">{ALGORITHMS[id].name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={run} disabled={running || algos.length === 0} className="bg-aurora text-primary-foreground hover:opacity-90 shadow-glow-primary gap-1.5">
          {running ? <Activity className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
          {running ? "Running benchmark..." : "Run benchmark"}
        </Button>
      </div>

      <StatGrid
        items={[
          { label: "Total Runs", value: totalRuns, accent: "primary" },
          { label: "Largest Size", value: sizes[sizes.length - 1] ?? "—", accent: "accent" },
          { label: "Fastest @ Max", value: fastest ? ALGORITHMS[fastest.id as AlgorithmId].name : "—", accent: "secondary", hint: fastest ? `${fastest.t.toFixed(2)} ms` : "" },
          { label: "Algorithms", value: algos.length, accent: "warning" },
        ]}
      />

      {results.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-display font-semibold mb-3">Runtime (ms) vs Input Size</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={results}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {algos.map((id) => (
                  <Line key={id} type="monotone" dataKey={`${id}_time`} name={ALGORITHMS[id].name} stroke={COLORS[id]} strokeWidth={2.5} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="font-display font-semibold mb-3">Comparisons vs Input Size</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={results}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {algos.map((id) => (
                  <Bar key={id} dataKey={`${id}_comp`} name={ALGORITHMS[id].name} fill={COLORS[id]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {Object.keys(summary).length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Aggregated summary</h3>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="py-2 pr-4">Algorithm</th>
                  <th className="py-2 pr-4">Total time</th>
                  <th className="py-2 pr-4">Comparisons</th>
                  <th className="py-2 pr-4">Swaps</th>
                  <th className="py-2 pr-4">Complexity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary).map(([id, s]) => (
                  <tr key={id} className="border-b border-border/30 last:border-0">
                    <td className="py-2 pr-4 font-medium">{ALGORITHMS[id as AlgorithmId].name}</td>
                    <td className="py-2 pr-4 font-mono">{s.time.toFixed(2)} ms</td>
                    <td className="py-2 pr-4 font-mono">{s.comparisons.toLocaleString()}</td>
                    <td className="py-2 pr-4 font-mono">{s.swaps.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline" className="font-mono">{ALGORITHMS[id as AlgorithmId].timeAvg}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
