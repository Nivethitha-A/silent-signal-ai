// SilentSignal AI — mock multimodal analysis engine
// Simulates text/voice/face analysis & stores sessions in localStorage.

export type SignalKey =
  | "stress"
  | "wellness"
  | "burnout"
  | "focus"
  | "fatigue"
  | "eyeStrain"
  | "posture"
  | "energy";

export interface MetricResult {
  key: SignalKey;
  label: string;
  value: number; // 0..100
  unit: "%" | "score";
  trend: number; // delta vs last session
  tone: "good" | "warn" | "bad";
}

export interface InsightLine {
  title: string;
  body: string;
  confidence: number; // 0..100
  severity: "info" | "warn" | "critical";
}

export interface RecoveryAction {
  id: string;
  title: string;
  duration: string;
  category: "breath" | "eye" | "posture" | "focus" | "sleep" | "hydrate" | "calm";
  rationale: string;
}

export interface ScanSession {
  id: string;
  createdAt: number;
  journal: string;
  modalities: { text: boolean; voice: boolean; face: boolean };
  metrics: MetricResult[];
  insights: InsightLine[];
  recovery: RecoveryAction[];
  guardian: { triggered: boolean; reason?: string };
}

const STORAGE_KEY = "silentsignal.sessions.v1";

// ---------- Storage ----------
export function loadSessions(): ScanSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanSession[];
  } catch {
    return [];
  }
}

export function saveSession(s: ScanSession) {
  const all = loadSessions();
  all.unshift(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 60)));
}

export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}

// ---------- Heuristics ----------
const STRESS_WORDS = ["tired", "exhausted", "anxious", "stress", "overwhelm", "panic", "burn", "drained", "headache", "sad", "lonely", "angry", "fear", "worry"];
const POSITIVE_WORDS = ["calm", "great", "happy", "energetic", "focused", "rested", "grateful", "peaceful"];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function textSentiment(text: string): { negativity: number; intensity: number } {
  const lower = text.toLowerCase();
  const neg = STRESS_WORDS.filter((w) => lower.includes(w)).length;
  const pos = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  const len = Math.min(text.length, 800);
  const intensity = clamp((len / 800) * 100, 10, 100);
  const negativity = clamp(40 + neg * 12 - pos * 14 + rand(-8, 8), 0, 100);
  return { negativity, intensity };
}

// ---------- Mock multimodal analyze ----------
export function runAnalysis(opts: {
  journal: string;
  modalities: { text: boolean; voice: boolean; face: boolean };
  previous?: ScanSession;
}): ScanSession {
  const { journal, modalities, previous } = opts;
  const sentiment = textSentiment(journal);

  const voiceBoost = modalities.voice ? rand(-6, 14) : 0;
  const faceBoost = modalities.face ? rand(-4, 16) : 0;

  const stress = clamp(sentiment.negativity * 0.7 + voiceBoost + faceBoost * 0.4 + rand(-6, 10));
  const fatigue = clamp(sentiment.negativity * 0.55 + faceBoost * 0.6 + rand(-4, 14));
  const eyeStrain = clamp((modalities.face ? 50 : 35) + rand(-12, 30));
  const posture = clamp((modalities.face ? 45 : 30) + rand(-10, 28));
  const focus = clamp(100 - stress * 0.6 + rand(-8, 12));
  const energy = clamp(100 - fatigue * 0.7 + rand(-8, 12));
  const burnout = clamp(stress * 0.5 + fatigue * 0.5 + rand(-6, 8));
  const wellness = clamp(100 - (stress * 0.35 + fatigue * 0.25 + burnout * 0.4));

  const last = previous?.metrics ?? [];
  const lastMap: Record<string, number> = {};
  last.forEach((m) => (lastMap[m.key] = m.value));

  const m = (key: SignalKey, label: string, value: number, invert = false): MetricResult => {
    const prev = lastMap[key] ?? value;
    const trend = +(value - prev).toFixed(1);
    const tone: MetricResult["tone"] = invert
      ? value > 70 ? "good" : value > 45 ? "warn" : "bad"
      : value < 30 ? "good" : value < 60 ? "warn" : "bad";
    return { key, label, value: +value.toFixed(1), unit: "%", trend, tone };
  };

  const metrics: MetricResult[] = [
    m("wellness", "Wellness Score", wellness, true),
    m("stress", "Stress Level", stress),
    m("burnout", "Burnout Risk", burnout),
    m("focus", "Focus Level", focus, true),
    m("fatigue", "Fatigue Score", fatigue),
    m("eyeStrain", "Eye Strain", eyeStrain),
    m("posture", "Posture Risk", posture),
    m("energy", "Energy Level", energy, true),
  ];

  // Insights
  const insights: InsightLine[] = [];
  if (stress > 60) {
    insights.push({
      title: "Elevated stress signature detected",
      body: "Voice tension and lexical patterns suggest sustained sympathetic arousal. Recommend a 4-7-8 breathing reset.",
      confidence: clamp(70 + rand(0, 22)),
      severity: stress > 80 ? "critical" : "warn",
    });
  }
  if (fatigue > 55) {
    insights.push({
      title: "Cognitive fatigue accumulating",
      body: "Reduced blink rate and slower vocal cadence indicate prolonged cognitive load and likely screen exposure.",
      confidence: clamp(65 + rand(0, 25)),
      severity: "warn",
    });
  }
  if (posture > 55) {
    insights.push({
      title: "Postural drift observed",
      body: "Forward-head and shoulder tilt detected over the scan window. Micro-mobility break recommended.",
      confidence: clamp(60 + rand(0, 20)),
      severity: "warn",
    });
  }
  if (wellness > 75) {
    insights.push({
      title: "Strong baseline wellness",
      body: "Your multimodal signals align with a well-regulated emotional and physical state. Keep the current rhythm.",
      confidence: clamp(75 + rand(0, 20)),
      severity: "info",
    });
  }
  if (insights.length === 0) {
    insights.push({
      title: "Subtle imbalance detected",
      body: "No critical signals, but micro-patterns suggest a brief recovery window would meaningfully reset your day.",
      confidence: clamp(60 + rand(0, 20)),
      severity: "info",
    });
  }

  // Recovery
  const recovery: RecoveryAction[] = [];
  if (stress > 50) recovery.push({ id: "breath", title: "4-7-8 Breathing Reset", duration: "3 min", category: "breath", rationale: "Lowers sympathetic load and slows heart rate." });
  if (eyeStrain > 50) recovery.push({ id: "eye", title: "20-20-20 Eye Relief", duration: "2 min", category: "eye", rationale: "Reduces accommodative fatigue from screen exposure." });
  if (posture > 50) recovery.push({ id: "posture", title: "Posture Re-Alignment", duration: "4 min", category: "posture", rationale: "Re-engages deep cervical flexors and scapular stabilizers." });
  if (focus < 55) recovery.push({ id: "focus", title: "Focus Reset Protocol", duration: "5 min", category: "focus", rationale: "Restores prefrontal engagement using a sensory grounding cycle." });
  if (energy < 50) recovery.push({ id: "hydrate", title: "Hydration & Mobility", duration: "1 min", category: "hydrate", rationale: "Restores plasma volume and cerebral perfusion." });
  if (burnout > 65) recovery.push({ id: "sleep", title: "Sleep Recovery Plan", duration: "tonight", category: "sleep", rationale: "Burnout trajectory benefits most from circadian repair." });
  if (recovery.length === 0) recovery.push({ id: "calm", title: "Calm Mode Maintenance", duration: "2 min", category: "calm", rationale: "Reinforce regulated baseline with a short coherence breath." });

  // Guardian Mode
  const guardianTrigger = stress > 88 || burnout > 85 || (fatigue > 80 && energy < 25);
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    journal,
    modalities,
    metrics,
    insights,
    recovery,
    guardian: {
      triggered: guardianTrigger,
      reason: guardianTrigger
        ? "Severe multimodal distress signature exceeds safe threshold."
        : undefined,
    },
  };
}

// ---------- Demo seed ----------
export function seedDemoIfEmpty() {
  if (loadSessions().length > 0) return;
  const now = Date.now();
  const day = 86400000;
  const entries = [
    "Slept well, focused morning. Coffee and a long walk.",
    "Back-to-back meetings, eyes are killing me.",
    "Feeling overwhelmed, deadline tomorrow, can't focus.",
    "Calmer today, did some breathing exercises.",
    "Exhausted. Headache. Need rest.",
  ];
  let prev: ScanSession | undefined;
  const out: ScanSession[] = [];
  entries.forEach((j, i) => {
    const s = runAnalysis({
      journal: j,
      modalities: { text: true, voice: i % 2 === 0, face: i % 3 === 0 },
      previous: prev,
    });
    s.createdAt = now - (entries.length - i) * day;
    out.unshift(s);
    prev = s;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
}

export function metricColor(key: SignalKey): string {
  switch (key) {
    case "stress": return "hsl(var(--signal-stress))";
    case "burnout": return "hsl(var(--signal-burnout))";
    case "fatigue":
    case "eyeStrain": return "hsl(var(--signal-fatigue))";
    case "posture": return "hsl(var(--signal-burnout))";
    case "focus": return "hsl(var(--signal-focus))";
    case "energy":
    case "wellness": return "hsl(var(--signal-energy))";
    default: return "hsl(var(--primary))";
  }
}
