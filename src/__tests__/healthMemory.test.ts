import { describe, expect, it } from "vitest";
import { aggregateHealthMemory, type MetricResult, type ScanSession } from "@/lib/silentSignal";

const fixedNow = new Date(2025, 0, 8, 23, 59).getTime();

function atDayOffset(offset: number, hour = 12) {
  const date = new Date(fixedNow);
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

function makeSession(createdAt: number, stress: number, wellness = 70): ScanSession {
  const metrics: MetricResult[] = [
    { key: "stress", label: "Stress Level", value: stress, unit: "%", trend: 0, tone: "warn" },
    { key: "wellness", label: "Wellness Score", value: wellness, unit: "%", trend: 0, tone: "good" },
  ];
  return {
    id: `${createdAt}-${stress}`,
    createdAt,
    journal: "Health memory test",
    modalities: { text: true, voice: false, face: false },
    metrics,
    insights: [],
    recovery: [],
    guardian: { triggered: false },
  };
}

describe("seven-day health-memory aggregation", () => {
  it("returns seven consecutive local days, including days without sessions", () => {
    const result = aggregateHealthMemory([makeSession(atDayOffset(-6), 30)], fixedNow);
    const expectedFirstDay = new Date(atDayOffset(-6));
    expectedFirstDay.setHours(0, 0, 0, 0);

    expect(result).toHaveLength(7);
    expect(result[0].dayStart).toBe(expectedFirstDay.getTime());
    expect(result[0].sessionCount).toBe(1);
    expect(result.slice(1).every((day) => day.sessionCount === 0)).toBe(true);
  });

  it("averages each day's metrics and excludes sessions outside the seven-day window or after now", () => {
    const sessions = [
      makeSession(atDayOffset(-1, 10), 40, 60),
      makeSession(atDayOffset(-1, 11), 60, 80),
      makeSession(atDayOffset(0, 10), 70, 90),
      makeSession(atDayOffset(-7), 100, 0),
      makeSession(atDayOffset(1), 100, 0),
    ];
    const result = aggregateHealthMemory(sessions, fixedNow);
    const yesterday = result[5];
    const today = result[6];

    expect(yesterday.sessionCount).toBe(2);
    expect(yesterday.metrics.stress).toBe(50);
    expect(yesterday.metrics.wellness).toBe(70);
    expect(today.sessionCount).toBe(1);
    expect(today.metrics.stress).toBe(70);
    expect(result.reduce((total, day) => total + day.sessionCount, 0)).toBe(3);
  });
});