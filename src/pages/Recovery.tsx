import { useEffect, useState } from "react";
import { Eye, Footprints, Heart, Moon, Play, Wind, Droplets, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSessions, seedDemoIfEmpty, type RecoveryAction, type ScanSession } from "@/lib/silentSignal";
import { RecoverySession } from "@/components/silent/RecoverySession";

const ICONS: Record<RecoveryAction["category"], any> = {
  breath: Wind, eye: Eye, posture: Footprints, focus: Brain, sleep: Moon, hydrate: Droplets, calm: Heart,
};

const Recovery = () => {
  const [latest, setLatest] = useState<ScanSession | null>(null);
  const [active, setActive] = useState<RecoveryAction | null>(null);

  useEffect(() => { seedDemoIfEmpty(); setLatest(loadSessions()[0] ?? null); }, []);

  const actions = latest?.recovery ?? [];

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Recovery Protocol Engine</div>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Personalized Recovery Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-curated micro-interventions tuned to your latest signals.</p>
      </div>

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
              <Button onClick={() => setActive(a)} className="mt-4 w-full bg-primary/20 text-primary hover:bg-primary/30">
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            </div>
          );
        })}
      </div>

      {!latest && <div className="glass rounded-2xl p-10 text-center text-muted-foreground">Run a scan to receive recovery protocols.</div>}

      <RecoverySession action={active} onClose={() => setActive(null)} />
    </div>
  );
};

export default Recovery;
