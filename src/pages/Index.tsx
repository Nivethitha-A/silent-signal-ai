import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, BarChart3, Brain, GitCompare, GraduationCap,
  Layers, Sparkles, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MODULES = [
  {
    to: "/visualizer",
    icon: Layers,
    title: "Visualization Engine",
    desc: "Step-by-step animated execution of sorting & searching with live code sync.",
    tag: "Interactive",
  },
  {
    to: "/performance",
    icon: Activity,
    title: "Performance Analysis",
    desc: "Run benchmarks across input sizes; track time, comparisons, swaps in real time.",
    tag: "Benchmarks",
  },
  {
    to: "/compare",
    icon: GitCompare,
    title: "Comparison Dashboard",
    desc: "Race multiple algorithms side-by-side on the same data.",
    tag: "Side-by-side",
  },
  {
    to: "/analyzer",
    icon: Target,
    title: "Input Analyzer",
    desc: "Detect sortedness, inversions, and patterns — get smart algorithm suggestions.",
    tag: "Logic",
  },
  {
    to: "/predict",
    icon: Brain,
    title: "ML Runtime Predictor",
    desc: "Train an in-browser neural net to predict runtime and recommend the best algorithm.",
    tag: "TensorFlow.js",
    accent: true,
  },
  {
    to: "/cases",
    icon: BarChart3,
    title: "Best / Worst Generator",
    desc: "Auto-generate best & worst case inputs for any algorithm and compare extremes.",
    tag: "Edge cases",
  },
  {
    to: "/learn",
    icon: GraduationCap,
    title: "Learning Mode",
    desc: '"What happens next?" interactive quizzes built from real algorithm runs.',
    tag: "Practice",
  },
];

const Index = () => {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="container pt-12 md:pt-20 pb-12 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] bg-glow opacity-70 pointer-events-none" />
        <div className="relative max-w-3xl">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 mb-5 border-primary/30 bg-primary/5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium">Intelligent Algorithm Analysis Platform</span>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-[1.05]">
            Visualize, benchmark, and{" "}
            <span className="aurora-text animate-aurora bg-aurora bg-clip-text">predict</span>{" "}
            algorithms — with ML.
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl">
            AlgoLab is more than a visualizer. It analyzes performance, detects input patterns,
            trains a neural network to predict runtime, and teaches you interactively.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-aurora text-primary-foreground hover:opacity-90 shadow-glow-primary gap-2">
              <Link to="/visualizer">
                Start visualizing <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/predict">
                <Brain className="h-4 w-4" /> Try ML predictor
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {["Bubble", "Selection", "Insertion", "Merge", "Quick", "Binary Search", "Linear Search"].map((a) => (
              <Badge key={a} variant="outline" className="font-mono text-xs">
                {a}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="container pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              7 modules
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">
              Everything you need to understand algorithms
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(({ to, icon: Icon, title, desc, tag, accent }) => (
            <Link
              key={to}
              to={to}
              className={`group glass rounded-2xl p-5 hover:scale-[1.015] hover:shadow-elevated transition-all ease-smooth duration-300 relative overflow-hidden ${
                accent ? "aurora-border" : ""
              }`}
            >
              {accent && <div className="absolute inset-0 bg-aurora-soft opacity-30 pointer-events-none" />}
              <div className="relative flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accent ? "bg-aurora shadow-glow-primary" : "bg-muted"}`}>
                  <Icon className={`h-5 w-5 ${accent ? "text-primary-foreground" : "text-foreground"}`} />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">{tag}</Badge>
              </div>
              <h3 className="relative font-display font-semibold text-lg">{title}</h3>
              <p className="relative text-sm text-muted-foreground mt-1.5">{desc}</p>
              <div className="relative flex items-center gap-1.5 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="container pb-12">
        <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Built with <span className="text-foreground font-medium">React</span>,{" "}
            <span className="text-foreground font-medium">TensorFlow.js</span>, and{" "}
            <span className="text-foreground font-medium">Recharts</span>.
          </div>
          <div className="font-mono">© AlgoLab</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
