import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, GraduationCap, RefreshCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALGORITHMS, AlgorithmId, getSortGenerator, Step } from "@/lib/algorithms";
import { genRandom } from "@/lib/inputAnalyzer";
import { ArrayBars } from "@/components/viz/ArrayBars";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ALGOS: AlgorithmId[] = ["bubble", "selection", "insertion"];

interface Question {
  beforeStep: Step;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const Learn = () => {
  const [algoId, setAlgoId] = useState<AlgorithmId>("bubble");
  const [array, setArray] = useState<number[]>(() => genRandom(10));
  const [steps, setSteps] = useState<Step[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const generate = () => {
    const arr = genRandom(10);
    setArray(arr);
    const list: Step[] = [];
    for (const s of getSortGenerator(algoId, arr)) list.push(s);
    setSteps(list);

    // Build questions: pick swap/compare moments and ask "what happens next?"
    const qs: Question[] = [];
    for (let i = 0; i < list.length - 1 && qs.length < 6; i++) {
      const cur = list[i];
      const nxt = list[i + 1];
      if (cur.type === "compare" && (nxt.type === "swap" || nxt.type === "compare")) {
        const a = cur.array!;
        const [x, y] = cur.indices!;
        const willSwap = a[x] > a[y];
        const correct = willSwap ? "Swap them" : "Move on (no swap)";
        qs.push({
          beforeStep: cur,
          options: ["Swap them", "Move on (no swap)", "Mark sorted", "Restart pass"],
          correctIdx: ["Swap them", "Move on (no swap)", "Mark sorted", "Restart pass"].indexOf(correct),
          explanation: willSwap
            ? `a[${x}]=${a[x]} > a[${y}]=${a[y]}, so the algorithm must swap.`
            : `a[${x}]=${a[x]} ≤ a[${y}]=${a[y]}, so no swap is needed.`,
        });
      }
    }
    setQuestions(qs);
    setQIdx(0);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
  };

  useEffect(() => { generate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [algoId]);

  const q = questions[qIdx];

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setScore((s) => ({
      correct: s.correct + (idx === q.correctIdx ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const next = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1);
      setPicked(null);
    } else {
      generate();
    }
  };

  const accuracy = score.total ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="container py-8 pb-32 lg:pb-8 space-y-6 animate-fade-up">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" /> Learning Mode
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-1">
          <span className="aurora-text">Predict the next step</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Watch an algorithm pause mid-execution. You decide what happens next. Build intuition
          one decision at a time.
        </p>
      </header>

      <div className="glass rounded-2xl p-5 grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Algorithm</Label>
          <Select value={algoId} onValueChange={(v) => setAlgoId(v as AlgorithmId)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALGOS.map((id) => (
                <SelectItem key={id} value={id}>{ALGORITHMS[id].name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
            <div className="font-display font-bold text-2xl tabular-nums">
              {score.correct} <span className="text-muted-foreground font-normal text-base">/ {score.total}</span>
              <span className="ml-3 text-sm font-normal text-muted-foreground">{accuracy}% accuracy</span>
            </div>
          </div>
          <Button variant="outline" onClick={generate} className="gap-1.5">
            <RefreshCcw className="h-4 w-4" /> New round
          </Button>
        </div>
      </div>

      {q ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-aurora-soft opacity-40 pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <Badge variant="outline" className="font-mono">Question {qIdx + 1} / {questions.length}</Badge>
              <span className="text-xs text-muted-foreground">comparing two elements</span>
            </div>
            <ArrayBars step={q.beforeStep} initialArray={array} className="h-44" />
            <p className="relative text-sm font-mono text-foreground/85">{q.beforeStep.message}</p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="font-display font-semibold">What happens next?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIdx;
                const isPicked = picked === i;
                const reveal = picked !== null;
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={reveal}
                    className={cn(
                      "text-left rounded-xl border px-4 py-3 transition-all duration-200 ease-smooth font-medium text-sm",
                      "hover:border-primary/60 hover:bg-primary/5",
                      reveal && isCorrect && "border-success/60 bg-success/15 text-success",
                      reveal && isPicked && !isCorrect && "border-destructive/60 bg-destructive/15 text-destructive",
                      !reveal && "border-border bg-muted/30",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {reveal && isCorrect && <CheckCircle2 className="h-4 w-4" />}
                      {reveal && isPicked && !isCorrect && <XCircle className="h-4 w-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <span className="font-semibold">Why: </span>{q.explanation}
              </div>
            )}
            {picked !== null && (
              <Button onClick={next} className="bg-aurora text-primary-foreground hover:opacity-90 shadow-glow-primary w-full">
                {qIdx < questions.length - 1 ? "Next question" : "Start new round"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
          Generating questions…
        </div>
      )}
    </div>
  );
};

export default Learn;
