import { useEffect, useState } from "react";
import { Phone, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSessions, seedDemoIfEmpty, type ScanSession } from "@/lib/silentSignal";
import { toast } from "@/hooks/use-toast";

const Guardian = () => {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  useEffect(() => { seedDemoIfEmpty(); setSessions(loadSessions()); }, []);

  const triggered = sessions.filter((s) => s.guardian.triggered);
  const latest = sessions[0];

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Guardian Mode</div>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Emergency Health Watch</h1>
        <p className="mt-1 text-sm text-muted-foreground">Watching for severe distress, prolonged fatigue and neurological anomalies.</p>
      </div>

      {latest?.guardian.triggered ? (
        <div className="aurora-border rounded-3xl p-8 glow-danger animate-pulse-glow">
          <div className="flex items-start gap-4">
            <ShieldAlert className="h-10 w-10 text-destructive animate-heartbeat" />
            <div className="flex-1">
              <div className="text-xs font-mono uppercase tracking-widest text-destructive">ACTIVE ALERT</div>
              <h2 className="mt-1 font-display text-2xl font-bold">Possible health abnormality detected</h2>
              <p className="mt-2 text-muted-foreground">{latest.guardian.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => toast({ title: "Caregiver notified", description: "Simulated emergency contact reached." })} className="bg-destructive text-destructive-foreground">
                  <Phone className="mr-2 h-4 w-4" /> Alert Caregiver
                </Button>
                <Button variant="outline" className="border-destructive/40 text-destructive">Open Crisis Resources</Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-10 w-10 text-success" />
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-success">ALL CLEAR</div>
              <h2 className="mt-1 font-display text-2xl font-bold">No critical signals detected</h2>
              <p className="mt-2 text-muted-foreground">Guardian Mode is monitoring in the background. You'll be alerted instantly if multimodal thresholds are crossed.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Alert history</div>
        {triggered.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No prior Guardian events recorded.</div>
        ) : (
          <div className="space-y-2">
            {triggered.map((s) => (
              <div key={s.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{s.guardian.reason}</div>
                  <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Guardian;
