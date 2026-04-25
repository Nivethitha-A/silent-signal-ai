import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Brain,
  GitCompare,
  GraduationCap,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: Sparkles, end: true },
  { to: "/visualizer", label: "Visualizer", icon: Layers },
  { to: "/performance", label: "Performance", icon: Activity },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/analyzer", label: "Input Analyzer", icon: Target },
  { to: "/predict", label: "ML Predict", icon: Brain },
  { to: "/cases", label: "Best / Worst", icon: BarChart3 },
  { to: "/learn", label: "Learning Mode", icon: GraduationCap },
];

export function AppShell() {
  return (
    <div className="min-h-screen w-full">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-border/40 backdrop-blur-xl bg-background/70">
        <div className="container flex h-16 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl bg-aurora animate-aurora flex items-center justify-center shadow-glow-primary">
              <span className="font-display font-bold text-primary-foreground text-sm">A</span>
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base tracking-tight">AlgoLab</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Intelligent Analysis
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
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <main className="pt-16">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
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
