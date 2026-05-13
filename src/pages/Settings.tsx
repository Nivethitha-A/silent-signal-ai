import { useState } from "react";
import { Bell, Camera, Mic, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { clearSessions } from "@/lib/silentSignal";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [name, setName] = useState("Subject 0001");
  const [voice, setVoice] = useState(true);
  const [face, setFace] = useState(true);
  const [alerts, setAlerts] = useState(true);

  return (
    <div className="container py-10 pb-28 lg:pb-10 max-w-3xl">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Profile & Sensors</div>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Settings</h1>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground"><User className="h-4 w-4" /> Identity</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background/40" />
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Sensors</div>
          <Row icon={Mic} label="Voice analysis" desc="Stress, cadence and tonal energy" v={voice} onChange={setVoice} />
          <Row icon={Camera} label="Face & eye tracking" desc="Blink, fatigue and posture signals" v={face} onChange={setFace} />
          <Row icon={Bell} label="Guardian alerts" desc="Notify caregivers on critical events" v={alerts} onChange={setAlerts} />
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Data</div>
          <Button variant="outline" className="border-destructive/40 text-destructive" onClick={() => { clearSessions(); toast({ title: "All sessions cleared" }); }}>
            <Trash2 className="mr-2 h-4 w-4" /> Erase all session memory
          </Button>
        </div>
      </div>
    </div>
  );
};

function Row({ icon: Icon, label, desc, v, onChange }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={v} onCheckedChange={onChange} />
    </div>
  );
}

export default Settings;
