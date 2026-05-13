import { useEffect, useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { loadSessions, seedDemoIfEmpty, type ScanSession } from "@/lib/silentSignal";

const Analytics = () => {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  useEffect(() => { seedDemoIfEmpty(); setSessions(loadSessions()); }, []);

  const data = useMemo(() => [...sessions].reverse().map((s) => ({
    t: new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    stress: s.metrics.find((m) => m.key === "stress")!.value,
    fatigue: s.metrics.find((m) => m.key === "fatigue")!.value,
    focus: s.metrics.find((m) => m.key === "focus")!.value,
    posture: s.metrics.find((m) => m.key === "posture")!.value,
    burnout: s.metrics.find((m) => m.key === "burnout")!.value,
  })), [sessions]);

  const delta = (key: keyof typeof data[number]) => {
    if (data.length < 2) return 0;
    const first = Number(data[0][key]); const last = Number(data[data.length - 1][key]);
    return last - first;
  };

  const KPIS = [
    { label: "Stress", v: delta("stress"), invert: false },
    { label: "Fatigue", v: delta("fatigue"), invert: false },
    { label: "Focus", v: delta("focus"), invert: true },
    { label: "Posture", v: delta("posture"), invert: false },
  ];

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Burnout Prediction Engine</div>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Long-Term Wellness Trajectory</h1>
        <p className="mt-1 text-sm text-muted-foreground">Multimodal patterns across your captured sessions.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {KPIS.map((k) => {
          const positive = k.invert ? k.v > 0 : k.v < 0;
          const Icon = k.v >= 0 ? TrendingUp : TrendingDown;
          return (
            <div key={k.label} className="glass rounded-2xl p-5">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{k.label} Δ</div>
              <div className={`mt-1 inline-flex items-center gap-1 font-display text-2xl font-bold ${positive ? "text-success" : "text-destructive"}`}>
                <Icon className="h-4 w-4" />
                {k.v > 0 ? "+" : ""}{k.v.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">since first session</div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-3 font-display text-lg font-semibold">Multimodal time series</div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="stress" stroke="hsl(var(--signal-stress))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fatigue" stroke="hsl(var(--signal-fatigue))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="burnout" stroke="hsl(var(--signal-burnout))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="focus" stroke="hsl(var(--signal-focus))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="posture" stroke="hsl(var(--signal-calm))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Pattern Detected</div>
          <p className="mt-2 text-foreground/90">
            Stress pattern shows a {delta("stress") >= 0 ? "rising" : "declining"} curve of {Math.abs(delta("stress")).toFixed(1)}% across recent sessions.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Forecast</div>
          <p className="mt-2 text-foreground/90">
            Burnout trajectory suggests {delta("burnout") > 5 ? "intervention within 7 days" : "stable risk profile this week"}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
