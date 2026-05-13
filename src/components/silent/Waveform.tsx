import { useEffect, useState } from "react";

export function Waveform({ active }: { active: boolean }) {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 36 }, () => 0.2));

  useEffect(() => {
    if (!active) { setBars((b) => b.map(() => 0.15)); return; }
    const id = setInterval(() => {
      setBars((b) => b.map(() => 0.15 + Math.random() * 0.85));
    }, 110);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="flex h-16 items-center justify-center gap-1 rounded-xl border border-primary/20 bg-background/50 px-3">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-aurora transition-all duration-100"
          style={{ height: `${h * 100}%`, opacity: 0.5 + h * 0.5 }}
        />
      ))}
    </div>
  );
}
