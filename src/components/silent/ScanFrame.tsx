import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  fallback?: boolean;
}

export function ScanFrame({ active, fallback }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!active || fallback) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch { /* fall back to demo visual */ }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [active, fallback]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-primary/30 bg-black/60 glow-primary">
      {/* HUD grid */}
      <div className="absolute inset-0 hud-grid opacity-40" />

      {/* Webcam */}
      {!fallback && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
      )}

      {/* Demo silhouette */}
      {fallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-full bg-gradient-to-b from-primary/30 to-secondary/20 blur-2xl" />
          <div className="absolute font-mono text-xs uppercase tracking-[0.3em] text-primary/80">demo subject</div>
        </div>
      )}

      {/* Scan line */}
      {active && (
        <div className="pointer-events-none absolute inset-x-0 h-32 bg-scan animate-scan" />
      )}

      {/* Face bracket */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-44 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-primary" />
        <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-primary" />
        <div className="absolute left-0 bottom-0 h-6 w-6 border-l-2 border-b-2 border-primary" />
        <div className="absolute right-0 bottom-0 h-6 w-6 border-r-2 border-b-2 border-primary" />
        <div className="absolute inset-0 rounded-[40%] border border-primary/40 animate-pulse" />
      </div>

      {/* Corner readouts */}
      <div className="absolute left-3 top-3 rounded-md bg-background/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-primary backdrop-blur">
        FACE_TRK · 98.2%
      </div>
      <div className="absolute right-3 top-3 rounded-md bg-background/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-secondary backdrop-blur">
        BLINK · {active ? "live" : "idle"}
      </div>
      <div className="absolute left-3 bottom-3 rounded-md bg-background/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-accent backdrop-blur">
        POSTURE · sampling
      </div>
      <div className="absolute right-3 bottom-3 rounded-md bg-background/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-primary backdrop-blur">
        {active ? "● REC" : "○ STBY"}
      </div>
    </div>
  );
}
