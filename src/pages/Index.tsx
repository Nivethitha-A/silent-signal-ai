import { Link } from "react-router-dom";
import { ArrowRight, Brain, Eye, HeartPulse, Mic, Radar, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIGNALS = [
  { icon: Brain, label: "Emotion", value: "Calm" },
  { icon: HeartPulse, label: "Stress", value: "32%" },
  { icon: Eye, label: "Eye Strain", value: "Low" },
  { icon: Mic, label: "Voice Tone", value: "Steady" },
];

const FEATURES = [
  { icon: Radar, title: "Multimodal Scan", body: "Text, voice and facial signals analyzed in real time." },
  { icon: Brain, title: "Burnout Prediction", body: "Catches deterioration weeks before symptoms surface." },
  { icon: HeartPulse, title: "Recovery Protocols", body: "Personalized breathing, focus and sleep interventions." },
  { icon: ShieldCheck, title: "Guardian Mode", body: "Emergency alerting when severe distress is detected." },
];

const Index = () => (
  <div>
    {/* HERO */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-glow" />
      <div className="absolute inset-0 hud-grid opacity-30" />
      <div className="container relative grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:py-32">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3 w-3" /> Behavioral Wellness Intelligence
          </div>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            AI That Understands<br />
            <span className="aurora-text animate-aurora">More Than Words.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Analyze emotions, stress, posture, fatigue and hidden wellness signals using
            AI-powered behavioral intelligence — multimodal, private, and built for prevention.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-aurora text-primary-foreground glow-primary hover:opacity-95">
              <Link to="/scan">
                <Radar className="mr-2 h-4 w-4" /> Start AI Scan
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
              <Link to="/dashboard">
                View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SIGNALS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-xl p-3">
                <Icon className="h-4 w-4 text-primary" />
                <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
                <div className="font-display text-sm font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating face / hologram */}
        <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-aurora-soft blur-3xl" />
          <div className="absolute h-72 w-72 rounded-full border border-primary/30 animate-spin-slow" />
          <div className="absolute h-56 w-56 rounded-full border border-secondary/30 animate-spin-slow" style={{ animationDirection: "reverse" }} />
          <div className="absolute h-40 w-40 rounded-full border border-accent/30 animate-pulse" />
          <div className="absolute h-24 w-24 rounded-full bg-aurora animate-aurora glow-primary animate-float" />
          <div className="absolute h-24 w-24 rounded-full animate-pulse-ring border border-primary/40" />
          <Waves className="relative h-12 w-12 text-primary-foreground" strokeWidth={2.2} />
          {/* Floating metrics */}
          <div className="absolute -left-2 top-6 glass rounded-xl px-3 py-2 text-xs font-mono">
            <div className="text-muted-foreground">HRV</div>
            <div className="text-primary">68 ms</div>
          </div>
          <div className="absolute -right-2 top-20 glass rounded-xl px-3 py-2 text-xs font-mono">
            <div className="text-muted-foreground">Focus</div>
            <div className="text-success">82%</div>
          </div>
          <div className="absolute -left-4 bottom-10 glass rounded-xl px-3 py-2 text-xs font-mono">
            <div className="text-muted-foreground">Posture</div>
            <div className="text-warning">tilt L</div>
          </div>
          <div className="absolute -right-4 bottom-4 glass rounded-xl px-3 py-2 text-xs font-mono">
            <div className="text-muted-foreground">Voice</div>
            <div className="text-secondary">steady</div>
          </div>
        </div>
      </div>
    </section>

    {/* FEATURES */}
    <section className="container py-16">
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Capabilities</div>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Detecting health signals humans ignore.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-elevated">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="font-display text-lg font-semibold">{title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* TAGLINE BAND */}
    <section className="container pb-24">
      <div className="aurora-border rounded-3xl p-10 text-center">
        <div className="text-xs font-mono uppercase tracking-[0.25em] text-primary">Your Silent Health Companion</div>
        <h3 className="mt-3 font-display text-3xl font-bold md:text-5xl">Prevention before symptoms.</h3>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          SilentSignal AI listens, watches and learns — so your body and mind get help before they ask.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg" className="bg-aurora text-primary-foreground glow-primary">
            <Link to="/scan">Begin First Scan</Link>
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default Index;
