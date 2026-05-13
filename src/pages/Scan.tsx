import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraOff, Mic, MicOff, Play, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScanFrame } from "@/components/silent/ScanFrame";
import { Waveform } from "@/components/silent/Waveform";
import { loadSessions, runAnalysis, saveSession } from "@/lib/silentSignal";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  "Initializing multimodal pipeline…",
  "Listening to vocal micro-tremors…",
  "Mapping facial micro-expressions…",
  "Tracking blink rate and eye fatigue…",
  "Estimating posture alignment…",
  "Synthesizing wellness intelligence…",
];

const Scan = () => {
  const navigate = useNavigate();
  const [journal, setJournal] = useState("");
  const [face, setFace] = useState(false);
  const [voice, setVoice] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const stageRef = useRef<number>(0);

  useEffect(() => {
    if (!scanning) return;
    setProgress(0); setStage(0); stageRef.current = 0;
    const totalMs = 4200;
    const start = performance.now();
    const id = setInterval(() => {
      const t = (performance.now() - start) / totalMs;
      const p = Math.min(1, t);
      setProgress(p * 100);
      const next = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));
      if (next !== stageRef.current) { stageRef.current = next; setStage(next); }
      if (p >= 1) {
        clearInterval(id);
        finishScan();
      }
    }, 60);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  function finishScan() {
    const previous = loadSessions()[0];
    const session = runAnalysis({
      journal: journal || "Quick check-in scan with no journal entry.",
      modalities: { text: !!journal, voice, face: face || demoMode },
      previous,
    });
    saveSession(session);
    toast({ title: "Scan complete", description: "Wellness report ready." });
    navigate("/dashboard");
  }

  function start() {
    if (!journal && !voice && !face && !demoMode) {
      toast({ title: "Add a signal", description: "Type a journal entry or enable a sensor (or Demo Mode)." });
      return;
    }
    setScanning(true);
  }

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Live Multimodal Scan</div>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">AI Scanning Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Capture how you feel, how you sound, and how you look — all at once.</p>
        </div>
        <Button variant="outline" className="border-primary/40" onClick={() => setDemoMode((v) => !v)}>
          <Sparkles className="mr-2 h-4 w-4" />
          {demoMode ? "Demo Mode: ON" : "Use Demo Mode"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT — scan frame */}
        <div className="lg:col-span-3 space-y-4">
          <ScanFrame active={scanning} fallback={demoMode || !face} />
          <Waveform active={scanning && (voice || demoMode)} />

          {scanning && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest">
                <span className="text-primary">Analyzing…</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-aurora" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 text-sm text-foreground/90">{STAGES[stage]}</div>
            </div>
          )}
        </div>

        {/* RIGHT — controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Journal</div>
            <Textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Today was exhausting. I feel mentally tired…"
              className="min-h-[140px] resize-none border-border/60 bg-background/40"
            />
            <div className="mt-2 text-[11px] font-mono text-muted-foreground">{journal.length} chars · text sentiment + intensity</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFace((v) => !v)}
              className={`glass rounded-2xl p-4 text-left transition ${face ? "ring-1 ring-primary glow-primary" : ""}`}
            >
              <div className="flex items-center justify-between">
                {face ? <Camera className="h-4 w-4 text-primary" /> : <CameraOff className="h-4 w-4 text-muted-foreground" />}
                <span className={`text-[10px] font-mono uppercase tracking-widest ${face ? "text-primary" : "text-muted-foreground"}`}>{face ? "ON" : "OFF"}</span>
              </div>
              <div className="mt-2 font-display text-sm font-semibold">Face & Eye Tracking</div>
              <div className="text-xs text-muted-foreground">Emotions · blink · posture</div>
            </button>
            <button
              onClick={() => setVoice((v) => !v)}
              className={`glass rounded-2xl p-4 text-left transition ${voice ? "ring-1 ring-secondary glow-secondary" : ""}`}
            >
              <div className="flex items-center justify-between">
                {voice ? <Mic className="h-4 w-4 text-secondary" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
                <span className={`text-[10px] font-mono uppercase tracking-widest ${voice ? "text-secondary" : "text-muted-foreground"}`}>{voice ? "ON" : "OFF"}</span>
              </div>
              <div className="mt-2 font-display text-sm font-semibold">Voice Analysis</div>
              <div className="text-xs text-muted-foreground">Stress · cadence · energy</div>
            </button>
          </div>

          <div className="aurora-border rounded-2xl p-5">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Run</div>
            <Button
              onClick={start}
              disabled={scanning}
              size="lg"
              className="mt-2 w-full bg-aurora text-primary-foreground glow-primary"
            >
              {scanning ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              {scanning ? "Scanning…" : "Initiate Scan"}
            </Button>
            <p className="mt-2 text-[11px] font-mono text-muted-foreground">
              All processing simulated locally. No audio or video leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
