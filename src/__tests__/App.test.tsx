import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";
import { saveSession, type MetricResult, type ScanSession } from "@/lib/silentSignal";

vi.mock("@/hooks/useAuth", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    user: { id: "app-test-user", email: "tester@example.com" },
    session: null,
    profile: { id: "app-test-user", display_name: "Test User", avatar_url: null },
    loading: false,
    signOut: async () => undefined,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: async () => ({ data: [], error: null }),
      }),
    }),
  },
}));

function makeSession(guardianTriggered = false): ScanSession {
  const values: Array<[MetricResult["key"], string, number]> = [
    ["wellness", "Wellness Score", 72],
    ["stress", "Stress Level", guardianTriggered ? 92 : 28],
    ["burnout", "Burnout Risk", 30],
    ["focus", "Focus Level", 75],
    ["fatigue", "Fatigue Score", 35],
    ["eyeStrain", "Eye Strain", 25],
    ["posture", "Posture Risk", 20],
    ["energy", "Energy Level", 70],
  ];
  const metrics: MetricResult[] = values.map(([key, label, value]) => ({
    key,
    label,
    value,
    unit: "%",
    trend: 0,
    tone: "good",
  }));

  return {
    id: guardianTriggered ? "guardian-session" : "regular-session",
    createdAt: Date.now(),
    journal: "App view test session",
    modalities: { text: true, voice: false, face: false },
    metrics,
    insights: [],
    recovery: [],
    guardian: guardianTriggered
      ? { triggered: true, reason: "High stress threshold exceeded." }
      : { triggered: false },
  };
}

function openAt(path: string) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

describe("SilentSignal app views", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renders the main dashboard without crashing", async () => {
    saveSession(makeSession());
    openAt("/dashboard");

    expect(await screen.findByRole("heading", { name: "Your Health Console" })).toBeInTheDocument();
    expect(screen.getByText("Wellness trend")).toBeInTheDocument();
  });

  it("renders the regular home view without crashing", () => {
    openAt("/");

    expect(screen.getByRole("heading", { name: /AI That Understands More Than Words/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start AI Scan/ })).toBeInTheDocument();
  });

  it("renders Guardian Mode and its active alert state without crashing", async () => {
    saveSession(makeSession(true));
    openAt("/guardian");

    expect(await screen.findByRole("heading", { name: "Emergency Health Watch" })).toBeInTheDocument();
    expect(await screen.findByText("ACTIVE ALERT")).toBeInTheDocument();
    expect(screen.getByText("High stress threshold exceeded.", { selector: "p" })).toBeInTheDocument();
  });
});