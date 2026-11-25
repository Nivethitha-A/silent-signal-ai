import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAnalysis } from "@/lib/silentSignal";

describe("multimodal wellness scoring and recovery selection", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("combines text, voice, and face inputs into bounded scores", () => {
    const textOnly = runAnalysis({
      journal: "calm",
      modalities: { text: true, voice: false, face: false },
    });
    const multimodal = runAnalysis({
      journal: "calm",
      modalities: { text: true, voice: true, face: true },
    });
    const values = Object.fromEntries(multimodal.metrics.map(({ key, value }) => [key, value]));
    const textOnlyValues = Object.fromEntries(textOnly.metrics.map(({ key, value }) => [key, value]));

    expect(values).toMatchObject({
      stress: 26.6,
      fatigue: 22.9,
      eyeStrain: 59,
      posture: 54,
      focus: 86,
      energy: 86,
      burnout: 25.8,
      wellness: 74.7,
    });
    expect(textOnlyValues.stress).toBe(20.2);
    expect(textOnlyValues.eyeStrain).toBe(44);
    expect(multimodal.metrics).toHaveLength(8);
    expect(multimodal.metrics.every(({ value }) => value >= 0 && value <= 100)).toBe(true);
  });

  it("selects calm maintenance when no recovery threshold is crossed", () => {
    const session = runAnalysis({
      journal: "calm",
      modalities: { text: true, voice: false, face: false },
    });

    expect(session.recovery.map(({ category }) => category)).toEqual(["calm"]);
  });

  it("selects the matching protocols when stress, fatigue, eyes, posture, focus, and burnout rise", () => {
    const session = runAnalysis({
      journal: "panic anxious exhausted stress overwhelmed",
      modalities: { text: true, voice: true, face: true },
    });

    expect(session.recovery.map(({ category }) => category)).toEqual([
      "breath",
      "eye",
      "posture",
      "focus",
      "sleep",
    ]);
  });
});