import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Brain, HeartPulse, Radar, ShieldAlert } from "lucide-react";
import { MetricCard } from "@/components/silent/MetricCard";
import { Button } from "@/components/ui/button";
import { loadSessions, seedDemoIfEmpty, type ScanSession } from "@/lib/silentSignal";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Dashboard = () => {
  const [sessions, setSessions] = useState<ScanSession[]>([]);

  useEffect(() => { seedDemoIfEmpty(); setSessions(loadSessions()); }, []);

  const latest = sessions[0];
  const trend = useMemo(() => {
    return [...sessions].reverse().map((s) => ({
      t: new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      stress: s.metrics.find((m) => m.key === "stress")?.value ?? 0,
      focus: s.metrics.find((m) => m.key === "focus")?.value ?? 0,
      wellness: s.metrics.find((m) => m.key === "wellness")?.value ?? 0,
    }));
  }, [sessions]);

  if (!latest) {
    return (
      <div className="container py-20 text-center">
        <Radar className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold">No scans yet</h1>
        <p className="mt-2 text-muted-foreground">Run your first AI scan to see your wellness signals.</p>
        <Button asChild className="mt-6 bg-aurora text-primary-foreground glow-primary">
          <Link to="/scan">Start Scan <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Wellness Intelligence</div>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Your Health Console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last scan {new Date(latest.createdAt).toLocaleString()} · {latest.modalities.text ? "text " : ""}{latest.modalities.voice ? "+ voice " : ""}{latest.modalities.face ? "+ face" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-primary/40">
            <Link to="/recovery"><HeartPulse className="mr-2 h-4 w-4" /> Recovery</Link>
          </Button>
          <Button asChild className="bg-aurora text-primary-foreground glow-primary">
            <Link to="/scan"><Radar className="mr-2 h-4 w-4" /> New Scan</Link>
          </Button>
        </div>
      </div>

      {latest.guardian.triggered && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 glow-danger">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-destructive">Guardian Mode triggered</div>
            <div className="text-sm text-muted-foreground">{latest.guardian.reason}</div>
          </div>
          <Button asChild size="sm" variant="outline" className="border-destructive/40 text-destructive">
            <Link to="/guardian">Open Guardian</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {latest.metrics.map((m) => <MetricCard key={m.key} metric={m} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Wellness trend</div>
              <div className="font-display text-lg font-semibold">Stress · Focus · Wellness</div>
            </div>
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--signal-stress))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--signal-stress))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--signal-focus))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--signal-focus))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--signal-energy))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--signal-energy))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area dataKey="stress" stroke="hsl(var(--signal-stress))" fill="url(#g1)" strokeWidth={2} />
                <Area dataKey="focus" stroke="hsl(var(--signal-focus))" fill="url(#g2)" strokeWidth={2} />
                <Area dataKey="wellness" stroke="hsl(var(--signal-energy))" fill="url(#g3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">AI Insights</div>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div className="space-y-3">
            {latest.insights.map((i, idx) => (
              <div key={idx} className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{i.title}</div>
                  <span className="text-[10px] font-mono text-primary">{i.confidence.toFixed(0)}%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">AI Companion</div>
            <div className="font-display text-lg font-semibold">Adaptive coaching</div>
          </div>
        </div>
        <p className="text-sm text-foreground/90">
          {latest.metrics.find((m) => m.key === "stress")!.value > 60
            ? "Your stress signature is elevated. Want to start a 4-7-8 breathing reset together?"
            : "Your signals look stable. Maintain it with a 2-minute coherence breath now."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-primary/20 text-primary hover:bg-primary/30"><Link to="/recovery">Start Recovery</Link></Button>
          <Button asChild size="sm" variant="outline" className="border-secondary/40"><Link to="/recovery">Calm Mode</Link></Button>
          <Button asChild size="sm" variant="outline" className="border-accent/40"><Link to="/recovery">Focus Mode</Link></Button>
          <Button asChild size="sm" variant="outline" className="border-warning/40"><Link to="/recovery">Eye Relief</Link></Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
