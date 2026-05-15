import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraOff, Mic, Square, RotateCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScanFrame } from "@/components/silent/ScanFrame";
import { Waveform } from "@/components/silent/Waveform";
import { loadSessions, saveSession, buildSessionFromAI, type AIWellnessReport } from "@/lib/silentSignal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  "Capturing your voice…",
  "Transcribing your story…",
  "Reading emotional signals…",
  "Mapping wellness intelligence…",
  "Generating recovery protocol…",
];

type SpeechResult = { isFinal: boolean; 0?: { transcript?: string } };
type SpeechResultList = { length: number; [index: number]: SpeechResult };
type SpeechRecognitionEventLike = { resultIndex: number; results: SpeechResultList };
type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;
type SpeechRecognitionWindow = Window & typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

const Scan = () => {
  const navigate = useNavigate();
  const [journal, setJournal] = useState("");
  const [transcript, setTranscript] = useState("");
  const [face, setFace] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const recordingRef = useRef(false);
  const speechRef = useRef<BrowserSpeechRecognition | null>(null);
  const liveTranscriptRef = useRef("");
  const browserTranscriptActiveRef = useRef(false);
  const serverLiveTranscriptRef = useRef(false);
  const liveTranscribingRef = useRef(false);
  const liveChunkQueueRef = useRef<Blob[]>([]);

  useEffect(() => () => stopStream(), []);

  function stopStream() {
    speechRef.current?.stop?.();
    speechRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recordingRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function appendTranscript(nextText: string) {
    const clean = nextText.replace(/\s+/g, " ").trim();
    if (!clean) return;
    const current = liveTranscriptRef.current.trim();
    const lowerCurrent = current.toLowerCase();
    const lowerClean = clean.toLowerCase();
    const combined = !current
      ? clean
      : lowerCurrent.endsWith(lowerClean)
        ? current
        : lowerClean.startsWith(lowerCurrent)
          ? clean
          : `${current} ${clean}`;
    liveTranscriptRef.current = combined.trim();
    setTranscript(liveTranscriptRef.current);
  }

  async function startRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !(window as any).MediaRecorder) {
        toast({ title: "Recording unavailable", description: "This browser cannot record audio. Type your story instead.", variant: "destructive" });
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      liveTranscriptRef.current = "";
      setTranscript("");
      browserTranscriptActiveRef.current = startBrowserTranscription();
      serverLiveTranscriptRef.current = !browserTranscriptActiveRef.current;
      liveTranscribingRef.current = false;
      liveChunkQueueRef.current = [];
      const mimeType = pickMime();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size <= 0) return;
        chunksRef.current.push(e.data);
        if (serverLiveTranscriptRef.current && recordingRef.current) enqueueLiveChunk(e.data);
      };
      mr.onstop = async () => {
        speechRef.current?.stop?.();
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        stopStream();
        await processAudio(blob);
      };
      mediaRef.current = mr;
      recordingRef.current = true;
      mr.start(3000);
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecSeconds((s) => {
          const next = s + 1;
          if (serverLiveTranscriptRef.current && next % 3 === 0 && mediaRef.current?.state === "recording") {
            try { mediaRef.current.requestData(); } catch { /* browser may not support manual chunks */ }
          }
          return next;
        });
      }, 1000);
      if (serverLiveTranscriptRef.current) {
        toast({ title: "Mobile live transcript enabled", description: "Keep speaking — transcript appears every few seconds." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Microphone blocked", description: "Allow mic access, or type your story instead.", variant: "destructive" });
    }
  }

  function stopRecording() {
    recordingRef.current = false;
    setRecording(false);
    speechRef.current?.stop?.();
    if (mediaRef.current?.state !== "inactive") mediaRef.current?.stop();
  }

  function startBrowserTranscription() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return false;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      if (finalText) liveTranscriptRef.current = `${liveTranscriptRef.current} ${finalText}`.trim();
      setTranscript(`${liveTranscriptRef.current} ${interimText}`.trim());
    };
    recognition.onerror = () => {
      browserTranscriptActiveRef.current = false;
      serverLiveTranscriptRef.current = true;
    };
    try {
      recognition.start();
    } catch {
      return false;
    }
    speechRef.current = recognition;
    return true;
  }

  function pickMime() {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/ogg"];
    for (const c of candidates) if ((window as any).MediaRecorder?.isTypeSupported?.(c)) return c;
    return "";
  }

  function enqueueLiveChunk(chunk: Blob) {
    liveChunkQueueRef.current.push(chunk);
    void flushLiveChunks();
  }

  async function flushLiveChunks() {
    if (liveTranscribingRef.current || !serverLiveTranscriptRef.current) return;
    const chunks = liveChunkQueueRef.current.splice(0);
    if (!chunks.length) return;
    liveTranscribingRef.current = true;
    try {
      const blob = new Blob(chunks, { type: mediaRef.current?.mimeType || chunks[0]?.type || "audio/webm" });
      const text = await transcribeBlob(blob);
      appendTranscript(text);
    } catch (e) {
      console.error("live transcription failed", e);
    } finally {
      liveTranscribingRef.current = false;
      if (liveChunkQueueRef.current.length) void flushLiveChunks();
    }
  }

  async function transcribeBlob(blob: Blob) {
    const fd = new FormData();
    fd.append("audio", blob, `story.${extensionForType(blob.type)}`);
    const { data, error } = await supabase.functions.invoke("transcribe", { body: fd });
    if (error) throw error;
    return String(data?.text ?? "").trim();
  }

  function extensionForType(type: string) {
    if (type.includes("mp4") || type.includes("aac")) return "m4a";
    if (type.includes("ogg")) return "ogg";
    if (type.includes("wav")) return "wav";
    return "webm";
  }

  async function processAudio(blob: Blob) {
    await flushLiveChunks();
    setBusy(true); setStage(1);
    try {
      const browserText = liveTranscriptRef.current.trim();
      if (browserText.length > 8 && !serverLiveTranscriptRef.current) {
        setTranscript(browserText);
        await analyze(browserText);
        return;
      }
      const text = await transcribeBlob(blob).catch(() => browserText);
      if (!text.trim()) throw new Error("Couldn't hear any speech — try again.");
      setTranscript(text);
      await analyze(text);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Transcription failed", description: e?.message ?? "Try again or type instead.", variant: "destructive" });
      setBusy(false); setStage(0);
    }
  }

  async function analyze(storyText: string) {
    setStage(2);
    try {
      const modalities = { text: !!journal, voice: true, face };
      const { data, error } = await supabase.functions.invoke("analyze-story", {
        body: { transcript: storyText + (journal ? `\n\nAdditional notes from user: ${journal}` : ""), modalities },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStage(3);
      const ai = data as AIWellnessReport;
      const previous = loadSessions()[0];
      const session = buildSessionFromAI(ai, journal || storyText, modalities, previous);
      setStage(4);
      saveSession(session);
      toast({ title: "Analysis complete", description: ai.summary });
      setTimeout(() => navigate("/dashboard"), 350);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Analysis failed", description: e?.message ?? "AI gateway error.", variant: "destructive" });
      setBusy(false); setStage(0);
    }
  }

  async function analyzeTextOnly() {
    if (!journal.trim()) {
      toast({ title: "Tell us your story", description: "Record your voice or type a journal entry first." });
      return;
    }
    setBusy(true); setTranscript(journal);
    await analyze(journal);
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Live Multimodal Scan</div>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">AI Scanning Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Speak your story. AI listens, transcribes, and decodes how you really feel.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <ScanFrame active={recording || busy} fallback={!face} />
          <Waveform active={recording} />

          {(recording || busy) && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest">
                <span className="text-primary">{recording ? "Recording" : "Processing"}</span>
                <span className="text-muted-foreground">{recording ? fmt(recSeconds) : `Stage ${stage}/4`}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-aurora transition-all" style={{ width: `${recording ? Math.min(100, recSeconds * 3) : (stage / 4) * 100}%` }} />
              </div>
              <div className="mt-3 text-sm text-foreground/90">{recording ? "Speak naturally — share what's on your mind." : STAGES[stage]}</div>
            </div>
          )}

          {transcript && !busy && !recording && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-2 text-xs font-mono uppercase tracking-widest text-primary">Transcript</div>
              <p className="text-sm text-foreground/90">{transcript}</p>
            </div>
          )}

          {recording && transcript && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-2 text-xs font-mono uppercase tracking-widest text-primary">Live Transcript</div>
              <p className="text-sm text-foreground/90">{transcript}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="aurora-border rounded-2xl p-5">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Voice Story</div>
            <div className="mt-3">
              {!recording ? (
                <Button onClick={startRecording} disabled={busy} size="lg" className="w-full bg-aurora text-primary-foreground glow-primary">
                  {busy ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                  {busy ? "Analyzing…" : "Start Recording"}
                </Button>
              ) : (
                <Button onClick={stopRecording} size="lg" variant="destructive" className="w-full">
                  <Square className="mr-2 h-4 w-4" />
                  Stop & Analyze ({fmt(recSeconds)})
                </Button>
              )}
            </div>
            <p className="mt-2 text-[11px] font-mono text-muted-foreground">
              Audio is sent securely to AI for transcription and emotion analysis.
            </p>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Or type a journal entry</div>
            <Textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Today was exhausting. I feel mentally tired…"
              className="min-h-[120px] resize-none border-border/60 bg-background/40"
            />
            <Button onClick={analyzeTextOnly} disabled={busy || recording} variant="outline" className="mt-3 w-full border-primary/40">
              <Send className="mr-2 h-4 w-4" /> Analyze text only
            </Button>
          </div>

          <button
            onClick={() => setFace((v) => !v)}
            className={`glass w-full rounded-2xl p-4 text-left transition ${face ? "ring-1 ring-primary glow-primary" : ""}`}
          >
            <div className="flex items-center justify-between">
              {face ? <Camera className="h-4 w-4 text-primary" /> : <CameraOff className="h-4 w-4 text-muted-foreground" />}
              <span className={`text-[10px] font-mono uppercase tracking-widest ${face ? "text-primary" : "text-muted-foreground"}`}>{face ? "ON" : "OFF"}</span>
            </div>
            <div className="mt-2 font-display text-sm font-semibold">Face & Eye Tracking (optional)</div>
            <div className="text-xs text-muted-foreground">Adds a visual signal to AI context</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scan;
