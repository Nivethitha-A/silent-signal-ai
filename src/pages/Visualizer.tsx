import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ALGORITHMS,
  AlgorithmId,
  Step,
  binarySearch,
  getSortGenerator,
  linearSearch,
} from "@/lib/algorithms";
import { genRandom, genReverse, genSorted, genNearlySorted } from "@/lib/inputAnalyzer";
import { ArrayBars } from "@/components/viz/ArrayBars";
import { CodePanel } from "@/components/viz/CodePanel";
import { StatGrid } from "@/components/viz/StatGrid";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Pattern = "random" | "sorted" | "reverse" | "nearly";

const Visualizer = () => {
  const [algoId, setAlgoId] = useState<AlgorithmId>("bubble");
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(50); // 1..100, higher = faster
  const [pattern, setPattern] = useState<Pattern>("random");
  const [target, setTarget] = useState(42);
  const [array, setArray] = useState<number[]>(() => genRandom(20));
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const algo = ALGORITHMS[algoId];
  const isSearch = algo.category === "search";

  const buildInput = useCallback(
    (p: Pattern, n: number) => {
      switch (p) {
        case "sorted": return genSorted(n);
        case "reverse": return genReverse(n);
        case "nearly": return genNearlySorted(n);
        default: return genRandom(n);
      }
    },
    [],
  );

  const generate = useCallback(() => {
    setPlaying(false);
    const arr = buildInput(pattern, size);
    setArray(arr);

    let gen: Generator<Step>;
    if (algoId === "binary-search") gen = binarySearch(arr, target);
    else if (algoId === "linear-search") gen = linearSearch(arr, target);
    else gen = getSortGenerator(algoId, arr);

    const list: Step[] = [];
    for (const s of gen) list.push(s);
    setSteps(list);
    setStepIndex(0);
  }, [algoId, size, pattern, target, buildInput]);

  // Regenerate when algo / size / pattern / target change
  useEffect(() => { generate(); }, [generate]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) { setPlaying(false); return; }
    const delay = Math.max(20, 800 - speed * 7.5);
    timerRef.current = window.setTimeout(() => setStepIndex((i) => i + 1), delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, stepIndex, steps.length, speed]);

  const currentStep = steps[stepIndex] ?? null;

  // Live counters up to current step
  const liveStats = useMemo(() => {
    let c = 0, sw = 0, ov = 0;
    for (let i = 0; i <= stepIndex && i < steps.length; i++) {
      if (steps[i].type === "compare") c++;
      if (steps[i].type === "swap") sw++;
      if (steps[i].type === "overwrite") ov++;
    }
    return { comparisons: c, swaps: sw, writes: ov };
  }, [steps, stepIndex]);

  const sortAlgos: AlgorithmId[] = ["bubble", "selection", "insertion", "merge", "quick"];
  const searchAlgos: AlgorithmId[] = ["binary-search", "linear-search"];

  return (
    <div className="container py-8 pb-32 lg:pb-8 space-y-6 animate-fade-up">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
            Visualization Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-1">
            <span className="aurora-text">{algo.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{algo.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="font-mono">Best {algo.timeBest}</Badge>
          <Badge variant="outline" className="font-mono">Avg {algo.timeAvg}</Badge>
          <Badge variant="outline" className="font-mono">Worst {algo.timeWorst}</Badge>
          <Badge variant="outline" className="font-mono">Space {algo.space}</Badge>
        </div>
      </header>

      {/* Controls */}
      <div className="glass rounded-2xl p-4 md:p-5 space-y-4">
        <Tabs value={algo.category === "search" ? "search" : "sort"}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="sort" onClick={() => setAlgoId("bubble")}>Sorting</TabsTrigger>
            <TabsTrigger value="search" onClick={() => setAlgoId("binary-search")}>Searching</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Algorithm</Label>
            <Select value={algoId} onValueChange={(v) => setAlgoId(v as AlgorithmId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(isSearch ? searchAlgos : sortAlgos).map((id) => (
                  <SelectItem key={id} value={id}>{ALGORITHMS[id].name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Input Pattern</Label>
            <Select value={pattern} onValueChange={(v) => setPattern(v as Pattern)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="sorted">Sorted</SelectItem>
                <SelectItem value="reverse">Reverse-sorted</SelectItem>
                <SelectItem value="nearly">Nearly sorted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between">
              Array Size <span className="text-muted-foreground font-mono">{size}</span>
            </Label>
            <Slider value={[size]} min={5} max={60} step={1} onValueChange={(v) => setSize(v[0])} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between">
              Speed <span className="text-muted-foreground font-mono">{speed}%</span>
            </Label>
            <Slider value={[speed]} min={1} max={100} step={1} onValueChange={(v) => setSpeed(v[0])} />
          </div>
        </div>

        {isSearch && (
          <div className="flex items-end gap-3 max-w-xs">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Search target</Label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={() => setPlaying((p) => !p)} className="bg-aurora text-primary-foreground hover:opacity-90 shadow-glow-primary gap-1.5">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setStepIndex(Math.min(steps.length - 1, stepIndex + 1))} disabled={stepIndex >= steps.length - 1}>
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setStepIndex(0)} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={generate} className="gap-1.5">
            <Shuffle className="h-4 w-4" /> Regenerate
          </Button>
          <div className="ml-auto text-xs font-mono text-muted-foreground">
            Step {stepIndex + 1} / {steps.length}
          </div>
        </div>
      </div>

      {/* Stats live */}
      <StatGrid
        items={[
          { label: "Comparisons", value: liveStats.comparisons, accent: "warning" },
          { label: "Swaps", value: liveStats.swaps, accent: "secondary" },
          { label: "Writes", value: liveStats.writes, accent: "accent" },
          { label: "Total Steps", value: steps.length, accent: "primary" },
        ]}
      />

      {/* Visualization + code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-4 md:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora-soft opacity-50 pointer-events-none" />
          <ArrayBars step={currentStep} initialArray={array} />
          <div className="relative mt-3 min-h-[2.5rem] text-sm text-foreground/90 px-2 font-mono">
            {currentStep?.message || "Press play to begin."}
          </div>
        </div>
        <CodePanel lines={algo.pseudocode} activeLine={currentStep?.line} />
      </div>
    </div>
  );
};

export default Visualizer;
