import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import type { RecoveryAction } from "@/lib/silentSignal";

type Phase = { label: string; seconds: number; cue?: string };

const PROTOCOLS: Record<RecoveryAction["category"], { phases?: Phase[]; cycles?: number; checklist?: string[] }> = {
  breath: {
    cycles: 4,
    phases: [
      { label: "Inhale", seconds: 4, cue: "Breathe in slowly through your nose" },
      { label: "Hold", seconds: 7, cue: "Hold gently — relax your jaw" },
      { label: "Exhale", seconds: 8, cue: "Long exhale through pursed lips" },
    ],
  },
  calm: {
    cycles: 10,
    phases: [
      { label: "Inhale", seconds: 5, cue: "Slow coherent breath in" },
      { label: "Exhale", seconds: 5, cue: "Soften and release" },
    ],
  },
  eye: {
    cycles: 2,
    phases: [
      { label: "Look 20 ft away", seconds: 20, cue: "Find a distant object and let your eyes rest on it" },
      { label: "Slow blinks", seconds: 10, cue: "Blink slowly and fully — 1 blink per second" },
      { label: "Palm your eyes", seconds: 15, cue: "Cup your palms over closed eyes, no pressure" },
    ],
  },
  posture: {
    cycles: 1,
    phases: [
      { label: "Chin tucks", seconds: 30, cue: "Pull your chin straight back, 1 sec hold × repeat" },
      { label: "Shoulder rolls", seconds: 30, cue: "Roll shoulders back and down — slow circles" },
      { label: "Doorway pec stretch", seconds: 60, cue: "Forearm on door frame, step gently forward" },
      { label: "Cat-cow", seconds: 60, cue: "On all fours, alternate arching and rounding" },
    ],
  },
  focus: {
    cycles: 1,
    phases: [
      { label: "5 things you see", seconds: 40, cue: "Name them out loud or in your head" },
      { label: "4 things you feel", seconds: 40, cue: "Texture under your hand, feet on the floor…" },
      { label: "3 things you hear", seconds: 40, cue: "Near sounds, far sounds, your own breath" },
      { label: "2 things you smell", seconds: 40, cue: "Or two scents you'd like to smell" },
      { label: "1 deep breath", seconds: 40, cue: "Long inhale, longer exhale — return" },
    ],
  },
  hydrate: {
    cycles: 1,
    phases: [
      { label: "Drink a full glass of water", seconds: 20, cue: "Sip steadily — don't gulp" },
      { label: "Neck rolls", seconds: 20, cue: "Slow half-circles, ear toward shoulder" },
      { label: "Stand & reach overhead", seconds: 20, cue: "Lengthen the spine, breathe deeply" },
    ],
  },
  sleep: {
    checklist: [
      "Dim overhead lights now",
      "Stop screens 30 minutes before bed",
      "Set room to 18–20°C / 64–68°F",
      "Journal one worry + one win",
      "Run 4-7-8 breathing 4× in bed",
    ],
  },
};

interface Props {
  action: RecoveryAction | null;
  onClose: () => void;
}

export function RecoverySession({ action, onClose }: Props) {
  const protocol = action ? PROTOCOLS[action.category] : null;
  const isChecklist = !!protocol?.checklist;

  const phases = protocol?.phases ?? [];
  const cycles = protocol?.cycles ?? 1;
  const totalSteps = phases.length * cycles;

  const [stepIdx, setStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!action) return;
    setStepIdx(0);
    setPaused(false);
    setDone(false);
    if (isChecklist) {
      setChecked(new Array(protocol!.checklist!.length).fill(false));
      setSecondsLeft(0);
    } else if (phases.length) {
      setSecondsLeft(phases[0].seconds);
    }
  }, [action]);

  useEffect(() => {
    if (!action || isChecklist || done || paused) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // advance step
        const next = stepIdx + 1;
        if (next >= totalSteps) {
          setDone(true);
          return 0;
        }
        const phase = phases[next % phases.length];
        setStepIdx(next);
        return phase.seconds;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [action, isChecklist, done, paused, stepIdx, totalSteps, phases]);

  useEffect(() => {
    if (done && action) {
      toast({ title: `${action.title} complete`, description: "Re-scan to measure improvement." });
    }
  }, [done, action]);

  const currentPhase = phases[stepIdx % phases.length];
  const cycleNum = Math.floor(stepIdx / Math.max(1, phases.length)) + 1;
  const totalSeconds = useMemo(
    () => phases.reduce((acc, p) => acc + p.seconds, 0) * cycles,
    [phases, cycles],
  );
  const elapsed = useMemo(() => {
    let e = 0;
    for (let i = 0; i < stepIdx; i += 1) e += phases[i % phases.length].seconds;
    if (currentPhase) e += currentPhase.seconds - secondsLeft;
    return e;
  }, [stepIdx, secondsLeft, phases, currentPhase]);

  const pct = totalSeconds ? Math.min(100, (elapsed / totalSeconds) * 100) : 0;

  // Breath circle scale based on phase
  const scale = useMemo(() => {
    if (!currentPhase) return 1;
    const label = currentPhase.label.toLowerCase();
    const t = 1 - secondsLeft / currentPhase.seconds; // 0..1 progress
    if (label.includes("inhale")) return 0.6 + 0.4 * t;
    if (label.includes("exhale")) return 1 - 0.4 * t;
    return 1;
  }, [currentPhase, secondsLeft]);

  if (!action) return null;

  return (
    <Dialog open={!!action} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{action.title}</DialogTitle>
        </DialogHeader>

        {isChecklist ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{action.rationale}</p>
            <ul className="space-y-2">
              {protocol!.checklist!.map((item, i) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
                  <Checkbox
                    checked={checked[i]}
                    onCheckedChange={(v) => {
                      const next = [...checked];
                      next[i] = !!v;
                      setChecked(next);
                      if (next.every(Boolean)) setDone(true);
                    }}
                    className="mt-0.5"
                  />
                  <span className={`text-sm ${checked[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <Button onClick={onClose} className="w-full bg-aurora text-primary-foreground">
              {done ? <><Check className="mr-2 h-4 w-4" /> Done</> : "Close"}
            </Button>
          </div>
        ) : done ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="h-8 w-8" />
            </div>
            <div className="font-display text-lg font-semibold">Protocol complete</div>
            <p className="text-sm text-muted-foreground">{action.rationale}</p>
            <Button onClick={onClose} className="w-full bg-aurora text-primary-foreground">Close</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Cycle {cycleNum} / {cycles}
              </div>
              <div className="mt-1 font-display text-2xl font-bold">{currentPhase?.label}</div>
              {currentPhase?.cue && (
                <p className="mt-1 text-sm text-muted-foreground">{currentPhase.cue}</p>
              )}
            </div>

            <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
              <div
                className="absolute h-full w-full rounded-full bg-aurora opacity-30 blur-xl transition-transform duration-1000 ease-in-out"
                style={{ transform: `scale(${scale})` }}
              />
              <div
                className="relative flex h-32 w-32 items-center justify-center rounded-full border border-primary/40 bg-background/60 transition-transform duration-1000 ease-in-out"
                style={{ transform: `scale(${scale})` }}
              >
                <span className="font-display text-4xl font-bold text-primary">{secondsLeft}</span>
              </div>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-aurora transition-all" style={{ width: `${pct}%` }} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPaused((p) => !p)}>
                {paused ? <><Play className="mr-2 h-4 w-4" /> Resume</> : <><Pause className="mr-2 h-4 w-4" /> Pause</>}
              </Button>
              <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={onClose}>
                <X className="mr-2 h-4 w-4" /> End early
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
