import { useMemo, useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { analyzeInput, genFewUnique, genNearlySorted, genRandom, genReverse, genSorted } from "@/lib/inputAnalyzer";
import { StatGrid } from "@/components/viz/StatGrid";

const Analyzer = () => {
  const [input, setInput] = useState("64, 34, 25, 12, 22, 11, 90, 50, 5, 77");

  const parsed = useMemo(() => {
    return input
      .split(/[\s,]+/)
      .map((x) => parseFloat(x))
      .filter((x) => !isNaN(x));
  }, [input]);

  const analysis = useMemo(() => analyzeInput(parsed), [parsed]);

  const presets = [
    { label: "Random", gen: () => genRandom(20) },
    { label: "Sorted", gen: () => genSorted(20) },
    { label: "Reverse", gen: () => genReverse(20) },
    { label: "Nearly sorted", gen: () => genNearlySorted(20) },
    { label: "Few unique", gen: () => genFewUnique(20, 3) },
  ];

  const setPreset = (gen: () => number[]) => setInput(gen().join(", "));

  const patternColor: Record<string, string> = {
    sorted: "bg-success/20 text-success border-success/40",
    reverse: "bg-destructive/20 text-destructive border-destructive/40",
    "nearly-sorted": "bg-accent/20 text-accent border-accent/40",
    random: "bg-muted text-foreground border-border",
    "few-unique": "bg-secondary/20 text-secondary border-secondary/40",
    constant: "bg-warning/20 text-warning border-warning/40",
  };

  return (
    <div className="container py-8 pb-32 lg:pb-8 space-y-6 animate-fade-up">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Input Analyzer</div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-1">
          Detect patterns, get <span className="aurora-text">smart recommendations</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Paste numbers (comma or space separated). The analyzer measures sortedness,
          inversions, and uniqueness — then recommends the best algorithm.
        </p>
      </header>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Input array</Label>
          <Textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 5, 3, 8, 1, 9, 2"
            className="font-mono text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button key={p.label} variant="outline" size="sm" onClick={() => setPreset(p.gen)}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <StatGrid
        items={[
          { label: "Size", value: analysis.size, accent: "primary" },
          { label: "Unique values", value: analysis.uniqueCount, accent: "accent" },
          { label: "Sortedness", value: `${(analysis.sortedness * 100).toFixed(0)}%`, accent: "secondary" },
          { label: "Inversions", value: analysis.inversions, accent: "warning" },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold">Detected pattern</h3>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${patternColor[analysis.pattern]} border text-sm uppercase tracking-wider px-3 py-1`}>
              {analysis.pattern.replace("-", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              confidence {(analysis.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-foreground/80">{analysis.description}</p>
        </div>

        <div className="glass rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora-soft opacity-60 pointer-events-none" />
          <div className="relative flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <h3 className="font-display font-semibold">Recommendation</h3>
          </div>
          <div className="relative">
            <div className="text-2xl font-display font-bold aurora-text">
              {analysis.recommendation.algorithm}
            </div>
            <p className="text-sm text-foreground/85 mt-2">{analysis.recommendation.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
