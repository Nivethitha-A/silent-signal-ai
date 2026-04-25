import { useEffect, useState } from "react";
import { Brain, Cpu, Sparkles, Zap } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatGrid } from "@/components/viz/StatGrid";
import {
  collectSamples, ML_ALGOS, ML_PATTERNS, PatternId, predictRuntime,
  recommendByPrediction, trainModel, TrainedModel, TrainSample,
} from "@/lib/mlPredictor";
import { ALGORITHMS, AlgorithmId } from "@/lib/algorithms";

const Predict = () => {
  const [samples, setSamples] = useState<TrainSample[]>([]);
  const [trained, setTrained] = useState<TrainedModel | null>(null);
  const [phase, setPhase] = useState<"idle" | "collecting" | "training" | "ready">("idle");
  const [progress, setProgress] = useState(0);
  const [epoch, setEpoch] = useState({ current: 0, loss: 0 });
  const [history, setHistory] = useState<{ epoch: number; loss: number }[]>([]);

  const [predSize, setPredSize] = useState(2000);
  const [predPattern, setPredPattern] = useState<PatternId>("random");

  const trainAll = async () => {
    setPhase("collecting");
    setHistory([]);
    setProgress(0);
    const sizes = [50, 100, 200, 400, 800];
    const data = await collectSamples(sizes, (done, total) => setProgress(done / total));
    setSamples(data);
    setPhase("training");
    const m = await trainModel(data, (e, l) => {
      setEpoch({ current: e + 1, loss: l });
      setHistory((h) => [...h, { epoch: e + 1, loss: +l.toFixed(5) }]);
    });
    setTrained(m);
    setPhase("ready");
  };

  // Predictions for current settings
  const recommendations = trained ? recommendByPrediction(trained, predSize, predPattern) : [];
  const best = recommendations[0];

  // Build a chart: predicted runtime per size for each algo
  const sizeRange = [100, 250, 500, 1000, 2000, 5000, 10000];
  const predChart = trained
    ? sizeRange.map((n) => {
        const row: Record<string, number | string> = { size: n };
        for (const id of ML_ALGOS) row[id] = +predictRuntime(trained, n, id, predPattern).toFixed(2);
        return row;
      })
    : [];

  const COLORS: Record<string, string> = {
    bubble: "hsl(var(--viz-swap))",
    selection: "hsl(var(--warning))",
    insertion: "hsl(var(--viz-current))",
    merge: "hsl(var(--primary))",
    quick: "hsl(var(--secondary))",
  };

  return (
    <div className="container py-8 pb-32 lg:pb-8 space-y-6 animate-fade-up">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5" /> Machine Learning Module
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-1">
          Predict runtime & <span className="aurora-text">recommend the best algorithm</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          A small neural network (TensorFlow.js, in your browser) is trained on real benchmarks
          across input sizes and patterns. It then predicts runtime for any size and recommends
          the fastest algorithm.
        </p>
      </header>

      {/* Train */}
      <div className="glass rounded-2xl p-5 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora-soft opacity-40 pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Train the model
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Collects ~125 benchmark samples across 5 sizes × 5 algorithms × 5 patterns,
              then trains an MLP for ~80 epochs.
            </p>
          </div>
          <Button
            onClick={trainAll}
            disabled={phase === "collecting" || phase === "training"}
            className="bg-aurora text-primary-foreground hover:opacity-90 shadow-glow-primary gap-1.5"
          >
            <Zap className="h-4 w-4" />
            {phase === "idle" && "Train model"}
            {phase === "collecting" && `Collecting ${(progress * 100).toFixed(0)}%`}
            {phase === "training" && `Training epoch ${epoch.current}`}
            {phase === "ready" && "Retrain"}
          </Button>
        </div>

        {phase !== "idle" && (
          <div className="relative grid md:grid-cols-3 gap-4">
            <Stat label="Phase" value={phase} />
            <Stat label="Samples collected" value={samples.length || Math.round(progress * 125)} />
            <Stat label="Final loss (MSE)" value={trained ? trained.finalLoss.toFixed(5) : epoch.loss ? epoch.loss.toFixed(5) : "—"} />
          </div>
        )}

        {history.length > 0 && (
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="loss" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Predict */}
      {trained && (
        <>
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" /> Make a prediction
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs flex justify-between">
                  Input size <span className="font-mono text-muted-foreground">{predSize.toLocaleString()}</span>
                </Label>
                <Slider value={[predSize]} min={100} max={10000} step={100} onValueChange={(v) => setPredSize(v[0])} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Input pattern</Label>
                <Select value={predPattern} onValueChange={(v) => setPredPattern(v as PatternId)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ML_PATTERNS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {best && (
            <div className="aurora-border rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-aurora-soft opacity-50 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">ML recommendation</div>
                  <div className="font-display font-bold text-3xl mt-1 aurora-text">
                    {ALGORITHMS[best.algoId].name}
                  </div>
                  <div className="text-sm text-foreground/85 mt-1">
                    Predicted ~<span className="font-mono font-semibold">{best.predictedMs.toFixed(2)} ms</span> for {predSize.toLocaleString()} elements ({predPattern}).
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-base">
                  {ALGORITHMS[best.algoId].timeAvg}
                </Badge>
              </div>
            </div>
          )}

          <StatGrid
            items={recommendations.map((r, i) => ({
              label: ALGORITHMS[r.algoId].name,
              value: r.predictedMs.toFixed(2) + " ms",
              hint: i === 0 ? "fastest predicted" : `${(r.predictedMs / Math.max(0.01, recommendations[0].predictedMs)).toFixed(1)}× slower`,
              accent: i === 0 ? "primary" : i === recommendations.length - 1 ? "warning" : undefined,
            })) as never}
          />

          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold mb-3">Predicted runtime curves ({predPattern})</h3>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={predChart}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {ML_ALGOS.map((id) => (
                  <Bar key={id} dataKey={id as string} name={ALGORITHMS[id as AlgorithmId].name} fill={COLORS[id]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display font-semibold text-lg mt-0.5 capitalize">{value}</div>
    </div>
  );
}

export default Predict;
