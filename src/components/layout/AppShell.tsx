import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  BookOpen,
  Heart,
  LayoutDashboard,
  Radar,
  Settings,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Sparkles, end: true },
  { to: "/scan", label: "AI Scan", icon: Radar },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Burnout", icon: Activity },
  { to: "/recovery", label: "Recovery", icon: Heart },
  { to: "/guardian", label: "Guardian", icon: ShieldAlert },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  return (
    <div className="min-h-screen w-full">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-border/40 backdrop-blur-xl bg-background/70">
        <div className="container flex h-16 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl bg-aurora animate-aurora flex items-center justify-center shadow-glow-primary">
              <Waves className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              <span className="absolute -inset-1 rounded-xl bg-primary/20 blur-md -z-10" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base tracking-tight">SilentSignal</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                AI Wellness OS
              </div>
            </div>
          </NavLink>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ease-smooth duration-200",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            AI ONLINE
          </div>
        </div>
      </div>

      <main className="pt-16">
        <Outlet />
      </main>

      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 glass-strong rounded-2xl px-2 py-2 flex items-center justify-between overflow-x-auto scroll-thin">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span className="truncate max-w-[56px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
