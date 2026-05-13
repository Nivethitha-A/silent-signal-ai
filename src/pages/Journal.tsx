import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSessions, loadSessions, seedDemoIfEmpty, type ScanSession } from "@/lib/silentSignal";

const tone = (v: number) => v < 30 ? "text-success" : v < 60 ? "text-warning" : "text-destructive";

const Journal = () => {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  useEffect(() => { seedDemoIfEmpty(); setSessions(loadSessions()); }, []);

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">AI Health Memory</div>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Journal & Session History</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sessions.length} captured signal sessions.</p>
        </div>
        <Button variant="outline" className="border-destructive/40 text-destructive" onClick={() => { clearSessions(); setSessions([]); }}>
          <Trash2 className="mr-2 h-4 w-4" /> Clear all
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-muted-foreground">No journal entries yet.</p>
          <Button asChild className="mt-4 bg-aurora text-primary-foreground glow-primary"><Link to="/scan">Start a scan</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const stress = s.metrics.find((m) => m.key === "stress")!.value;
            const focus = s.metrics.find((m) => m.key === "focus")!.value;
            const wellness = s.metrics.find((m) => m.key === "wellness")!.value;
            return (
              <div key={s.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()} · {[s.modalities.text && "text", s.modalities.voice && "voice", s.modalities.face && "face"].filter(Boolean).join(" + ")}
                    </div>
                    <p className="mt-1 text-sm text-foreground/90 line-clamp-2">{s.journal}</p>
                    {s.insights[0] && (
                      <div className="mt-2 rounded-lg border border-border/50 bg-background/40 p-2 text-xs text-muted-foreground">
                        <span className="text-primary font-mono mr-1">AI:</span>{s.insights[0].title}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4 font-mono text-xs">
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-muted-foreground">Stress</div>
                      <div className={`font-display text-lg font-bold ${tone(stress)}`}>{Math.round(stress)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-muted-foreground">Focus</div>
                      <div className="font-display text-lg font-bold text-primary">{Math.round(focus)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase text-muted-foreground">Well</div>
                      <div className="font-display text-lg font-bold text-success">{Math.round(wellness)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Journal;
