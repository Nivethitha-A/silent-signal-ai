import { useEffect, useRef, useState } from "react";
import { Play, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ALGORITHMS, AlgorithmId, getSortGenerator, Step } from "@/lib/algorithms";
import { genNearlySorted, genRandom, genReverse, genSorted } from "@/lib/inputAnalyzer";
import { ArrayBars } from "@/components/viz/ArrayBars";
import { Checkbox } from "@/components/ui/checkbox";

const SORTS: AlgorithmId[] = ["bubble", "selection", "insertion", "merge", "quick"];
type Pattern = "random" | "sorted" | "reverse" | "nearly";

interface Lane {
  id: AlgorithmId;
  steps: Step[];
  index: number;
  comparisons: number;
  swaps: number;
  done: boolean;
}

const Compare = () => {
  const [selected, setSelected] = useState<AlgorithmId[]>(["bubble", "merge", "quick"]);
  const [size, setSize] = useState(25);
  const [pattern, setPattern] = useState<Pattern>("random");
  const [speed, setSpeed] = useState(60);
  const [array, setArray] = useState<number[]>(() => genRandom(25));
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const buildInput = () => {
    switch (pattern) {
      case "sorted": return genSorted(size);
      case "reverse": return genReverse(size);
      case "nearly": return genNearlySorted(size);
      default: return genRandom(size);
    }
  };

  const setup = () => {
    setPlaying(false);
    const arr = buildInput();
    setArray(arr);
    const next: Lane[] = selected.map((id) => {
      const steps: Step[] = [];
      for (const s of getSortGenerator(id, arr)) steps.push(s);
      return { id, steps, index: 0, comparisons: 0, swaps: 0, done: false };
    });
    setLanes(next);
  };

  useEffect(() => { setup(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [selected.join(","), size, pattern]);

  useEffect(() => {
    if (!playing) return;
    const allDone = lanes.every((l) => l.index >= l.steps.length - 1);
    if (allDone) { setPlaying(false); return; }
    const delay = Math.max(20, 800 - speed * 7.5);
    timerRef.current = window.setTimeout(() => {
      setLanes((ls) =>
        ls.map((l) => {
          if (l.index >= l.steps.length - 1) return { ...l, done: true };
          const next = l.index + 1;
          const step = l.steps[next];
          return {
            ...l,
            index: next,
            comparisons: l.comparisons + (step.type === "compare" ? 1 : 0),
            swaps: l.swaps + (step.type === "swap" ? 1 : 0),
            done: next >= l.steps.length - 1,
          };
        }),
      );
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, lanes, speed]);

  const toggle = (id: AlgorithmId) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <div className="container py-8 pb-32 lg:pb-8 space-y-6 animate-fade-up">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Comparison Dashboard</div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-1">
          Race algorithms <span className="aurora-text">side-by-side</span>
        </h1>
      </header>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Pattern</Label>
            <Select value={pattern} onValueChange={(v) => setPattern(v as Pattern)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="sorted">Sorted</SelectItem>
                <SelectItem value="reverse">Reverse</SelectItem>
                <SelectItem value="nearly">Nearly sorted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between">Size <span className="font-mono text-muted-foreground">{size}</span></Label>
            <Slider value={[size]} min={10} max={50} step={1} onValueChange={(v) => setSize(v[0])} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between">Speed <span className="font-mono text-muted-foreground">{speed}%</span></Label>
            <Slider value={[speed]} min={1} max={100} step={1} onValueChange={(v) => setSpeed(v[0])} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {SORTS.map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={selected.includes(id)} onCheckedChange={() => toggle(id)} />
              <span className="font-medium">{ALGORITHMS[id].name}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setPlaying((p) => !p)} className="bg-aurora text-primary-foreground hover:opacity-90 shadow-glow-primary gap-1.5">
            <Play className="h-4 w-4" /> {playing ? "Pause" : "Race"}
          </Button>
          <Button variant="outline" onClick={setup} className="gap-1.5">
            <RefreshCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 ${lanes.length >= 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"}`}>
        {lanes.map((l) => {
          const step = l.steps[l.index];
          const progress = l.steps.length ? ((l.index + 1) / l.steps.length) * 100 : 0;
          return (
            <div key={l.id} className="glass rounded-2xl p-4 space-y-3 relative overflow-hidden">
              {l.done && (
                <Badge className="absolute top-3 right-3 bg-success text-success-foreground">Done</Badge>
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">{ALGORITHMS[l.id].name}</h3>
                <span className="text-[11px] font-mono text-muted-foreground">
                  step {l.index + 1}/{l.steps.length}
                </span>
              </div>
              <ArrayBars step={step} initialArray={array} className="h-44" />
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-aurora transition-all duration-200 ease-smooth" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-md bg-muted/50 px-2 py-1.5">
                  <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Comp</div>
                  <div className="font-mono font-semibold tabular-nums">{l.comparisons}</div>
                </div>
                <div className="rounded-md bg-muted/50 px-2 py-1.5">
                  <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Swaps</div>
                  <div className="font-mono font-semibold tabular-nums">{l.swaps}</div>
                </div>
                <div className="rounded-md bg-muted/50 px-2 py-1.5">
                  <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Avg</div>
                  <div className="font-mono font-semibold tabular-nums">{ALGORITHMS[l.id].timeAvg}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Compare;
