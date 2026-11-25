import { afterEach, describe, expect, it, vi } from "vitest";
import { runAnalysis, shouldTriggerGuardian } from "@/lib/silentSignal";

describe("Guardian Mode thresholds", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("triggers above the high-stress threshold but not at the threshold", () => {
    const stable = { stress: 88, burnout: 20, fatigue: 20, energy: 80 };

    expect(shouldTriggerGuardian(stable)).toBe(false);
    expect(shouldTriggerGuardian({ ...stable, stress: 88.1 })).toBe(true);
  });

  it("also triggers for severe burnout or combined fatigue and low energy", () => {
    expect(shouldTriggerGuardian({ stress: 20, burnout: 85.1, fatigue: 20, energy: 80 })).toBe(true);
    expect(shouldTriggerGuardian({ stress: 20, burnout: 20, fatigue: 80.1, energy: 24.9 })).toBe(true);
    expect(shouldTriggerGuardian({ stress: 20, burnout: 20, fatigue: 80.1, energy: 25 })).toBe(false);
  });

  it("marks an analyzed high-distress story as a Guardian alert", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    const session = runAnalysis({
      journal: "panic anxious exhausted stress overwhelmed",
      modalities: { text: true, voice: true, face: true },
    });

    expect(session.metrics.find(({ key }) => key === "stress")?.value).toBeGreaterThan(88);
    expect(session.guardian.triggered).toBe(true);
    expect(session.guardian.reason).toContain("threshold");
  });
});