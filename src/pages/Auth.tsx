import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Mode = "signin" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const dest = from && from.startsWith("/") ? from : "/dashboard";

  useEffect(() => {
    if (!loading && user) navigate(dest, { replace: true });
  }, [user, loading, dest, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast({ title: "Google sign-in failed", variant: "destructive" });
      return;
    }
    if (result.redirected) return;
    navigate(dest, { replace: true });
  };

  const reset = async () => {
    if (!email) {
      toast({ title: "Enter your email first" });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    toast({
      title: error ? error.message : "Reset link sent — check your inbox",
      variant: error ? "destructive" : undefined,
    });
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 pb-28 lg:pb-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>

        <div className="glass rounded-3xl p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-aurora animate-aurora shadow-glow-primary">
              <Waves className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                SilentSignal AI
              </div>
              <h1 className="font-display text-xl font-bold">
                {mode === "signin" ? "Sign in to your console" : "Create your account"}
              </h1>
            </div>
          </div>

          {sent ? (
            <div className="space-y-4 text-sm">
              <p className="text-foreground/90">
                We sent a confirmation link to <span className="font-semibold">{email}</span>. Open
                it to activate your account, then sign in.
              </p>
              <Button
                variant="outline"
                className="w-full border-primary/40"
                onClick={() => {
                  setSent(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Display name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="How should we greet you?"
                      className="bg-background/40"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-background/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/40"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-aurora text-primary-foreground glow-primary"
                >
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border/60" /> or <span className="h-px flex-1 bg-border/60" />
              </div>

              <button
                type="button"
                className="lovable-auth-button w-full"
                onClick={google}
                disabled={busy}
              >
                Continue with Google
              </button>

              <div className="mt-6 flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create an account" : "I already have an account"}
                </button>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={reset}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
