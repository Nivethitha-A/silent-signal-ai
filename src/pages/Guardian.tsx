import { useEffect, useState } from "react";
import { Phone, PhoneCall, ShieldAlert, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSessions, seedDemoIfEmpty, type ScanSession } from "@/lib/silentSignal";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type GuardianContact = { id: string; name: string | null; phone: string };

const Guardian = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [guardians, setGuardians] = useState<GuardianContact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [notified, setNotified] = useState<string | null>(null);

  useEffect(() => { seedDemoIfEmpty(); setSessions(loadSessions()); }, []);

  useEffect(() => {
    if (!user) return;
    (supabase.from("guardians" as any) as any)
      .select("id, name, phone")
      .order("created_at", { ascending: true })
      .then(({ data, error }: any) => {
        if (error) toast({ title: error.message, variant: "destructive" });
        else setGuardians(data ?? []);
      });
  }, [user]);

  const addGuardian = async () => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    if (!user) return;
    if (cleanPhone.length < 6) {
      toast({ title: "Enter a valid phone number", variant: "destructive" });
      return;
    }
    setAdding(true);
    const { data, error } = await (supabase.from("guardians" as any) as any)
      .insert({ user_id: user.id, name: name.trim() || null, phone: cleanPhone })
      .select("id, name, phone")
      .single();
    setAdding(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    setGuardians((g) => [...g, data]);
    setName("");
    setPhone("");
    toast({ title: "Guardian added", description: `${data.name ?? data.phone} will be alerted on critical events.` });
  };

  const removeGuardian = async (id: string) => {
    const { error } = await (supabase.from("guardians" as any) as any).delete().eq("id", id);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    setGuardians((g) => g.filter((x) => x.id !== id));
    toast({ title: "Guardian removed" });
  };

  const alertGuardian = (g: GuardianContact) => {
    setNotified(g.id);
    toast({
      title: "Guardian alerted",
      description: `Emergency notification sent to ${g.name ?? g.phone} (${g.phone}).`,
    });
  };

  const triggered = sessions.filter((s) => s.guardian.triggered);
  const latest = sessions[0];

  return (
    <div className="container py-10 pb-28 lg:pb-10">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Guardian Mode</div>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Emergency Health Watch</h1>
        <p className="mt-1 text-sm text-muted-foreground">Watching for severe distress, prolonged fatigue and neurological anomalies.</p>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <UserPlus className="h-4 w-4" /> Your Guardians
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength={60}
            className="bg-background/40"
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number, e.g. +91 98765 43210"
            type="tel"
            inputMode="tel"
            maxLength={20}
            className="bg-background/40"
          />
          <Button onClick={addGuardian} disabled={adding || !phone.trim()} className="bg-primary/20 text-primary hover:bg-primary/30 shrink-0">
            <UserPlus className="mr-2 h-4 w-4" /> Add Guardian
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {guardians.length === 0 ? (
            <div className="text-sm text-muted-foreground">No guardians yet. Add a trusted contact who gets alerted on critical events.</div>
          ) : (
            guardians.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/30 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{g.name ?? "Guardian"}</div>
                    <div className="text-xs text-muted-foreground">{g.phone}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className={notified === g.id ? "border-success/40 text-success" : "border-primary/40 text-primary"}
                    onClick={() => alertGuardian(g)}
                  >
                    <PhoneCall className="mr-1 h-3.5 w-3.5" /> {notified === g.id ? "Alerted" : "Alert"}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => removeGuardian(g.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6">
        {latest?.guardian.triggered ? (
          <div className="aurora-border rounded-3xl p-8 glow-danger animate-pulse-glow">
            <div className="flex items-start gap-4">
              <ShieldAlert className="h-10 w-10 text-destructive animate-heartbeat" />
              <div className="flex-1">
                <div className="text-xs font-mono uppercase tracking-widest text-destructive">ACTIVE ALERT</div>
                <h2 className="mt-1 font-display text-2xl font-bold">Possible health abnormality detected</h2>
                <p className="mt-2 text-muted-foreground">{latest.guardian.reason}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {guardians.length > 0 ? (
                    guardians.map((g) => (
                      <Button key={g.id} onClick={() => alertGuardian(g)} className="bg-destructive text-destructive-foreground">
                        <Phone className="mr-2 h-4 w-4" /> Alert {g.name ?? g.phone}
                      </Button>
                    ))
                  ) : (
                    <Button onClick={() => toast({ title: "No guardian added yet", description: "Add a phone number above first.", variant: "destructive" })} className="bg-destructive text-destructive-foreground">
                      <Phone className="mr-2 h-4 w-4" /> Alert Caregiver
                    </Button>
                  )}
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
                <p className="mt-2 text-muted-foreground">Guardian Mode is monitoring in the background. Your guardians will be alerted instantly if multimodal thresholds are crossed.</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
