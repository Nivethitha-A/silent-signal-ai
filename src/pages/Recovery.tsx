import { useEffect, useState } from "react";
import { Eye, Footprints, Heart, Moon, Play, Sparkles, Wind, Droplets, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSessions, seedDemoIfEmpty, type RecoveryAction, type ScanSession } from "@/lib/silentSignal";
import { toast } from "@/hooks/use-toast";

const ICONS: Record<RecoveryAction["category"], any> = {
  breath: Wind, eye: Eye, posture: Footprints, focus: Brain, sleep: Moon, hydrate: Droplets, calm: Heart,
};

const Recovery = () => {
  const [latest, setLatest] = useState<ScanSession | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => { seedDemoIfEmpty(); setLatest(loadSessions()[0] ?? null); }, []);

  useEffect(() => {
    if (!active) return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); setActive(null); toast({ title: "Protocol complete", description: "Re-scan to measure improvement." }); return 0; }
        return p + 2;
      });
    }, 80);
    return () => clearInterval(id);
  }, [active]);

  const actions = latest?.recovery ?? [];

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Recovery Protocol Engine</div>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Personalized Recovery Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-curated micro-interventions tuned to your latest signals.</p>
      </div>

      {active && (
        <div className="mb-6 aurora-border rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-primary">Initiating Recovery Protocol…</div>
              <div className="mt-1 font-display text-xl font-bold">{actions.find((a) => a.id === active)?.title}</div>
            </div>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-aurora" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-right text-xs font-mono text-muted-foreground">{progress}%</div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => {
          const Icon = ICONS[a.category];
          return (
            <div key={a.id} className="glass rounded-2xl p-5 transition hover:-translate-y-0.5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display text-lg font-semibold">{a.title}</div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{a.duration}</div>
              <p className="mt-2 text-sm text-muted-foreground">{a.rationale}</p>
              <Button onClick={() => setActive(a.id)} disabled={!!active} className="mt-4 w-full bg-primary/20 text-primary hover:bg-primary/30">
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            </div>
          );
        })}
      </div>

      {!latest && <div className="glass rounded-2xl p-10 text-center text-muted-foreground">Run a scan to receive recovery protocols.</div>}
    </div>
  );
};

export default Recovery;
