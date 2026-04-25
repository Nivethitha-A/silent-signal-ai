import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Visualizer from "./pages/Visualizer";
import Performance from "./pages/Performance";
import Compare from "./pages/Compare";
import Analyzer from "./pages/Analyzer";
import Predict from "./pages/Predict";
import Cases from "./pages/Cases";
import Learn from "./pages/Learn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/visualizer" element={<Visualizer />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/analyzer" element={<Analyzer />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/learn" element={<Learn />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
