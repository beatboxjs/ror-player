import { describe, expect, it, test } from "vitest";
import { loadPracticeSettings, normalizePracticeSettings } from "../practiceSettings";

describe("loadPracticeSettings", () => {
  it("returns defaults and flags recovery on corrupt JSON", () => {
    const r = loadPracticeSettings("{ not json");
    expect(r.recovered).toBe(true);
    expect(r.settings).toEqual(normalizePracticeSettings());
  });

  it("returns defaults and flags recovery on wrong-type field", () => {
    // difficulty must be an enum; a number is non-coercible
    const r = loadPracticeSettings(JSON.stringify({ difficulty: 42 }));
    expect(r.recovered).toBe(true);
    expect(r.settings.difficulty).toBe("easy");
  });

  it("parses a valid blob without flagging recovery", () => {
    const r = loadPracticeSettings(JSON.stringify({ difficulty: "hard" }));
    expect(r.recovered).toBe(false);
    expect(r.settings.difficulty).toBe("hard");
  });

  it("treats null (absent key) as a clean default, not a recovery", () => {
    const r = loadPracticeSettings(null);
    expect(r.recovered).toBe(false);
    expect(r.settings).toEqual(normalizePracticeSettings());
  });

  it("returns defaults and flags recovery on a valid JSON non-object", () => {
    const r = loadPracticeSettings(JSON.stringify("hello"));
    expect(r.recovered).toBe(true);
    expect(r.settings).toEqual(normalizePracticeSettings());
  });
});

test("normalizePracticeSettings defaults", () => {
  expect(normalizePracticeSettings()).toEqual({
    latencyOffsetMs: 0,
    sensitivity: 1,
    micPromptAcked: false,
    headphonesWarningAcked: false,
    lastMode: "instrument",
    difficulty: "easy"
  });
});

test("normalizePracticeSettings clamps sensitivity", () => {
  expect(normalizePracticeSettings({ sensitivity: 10 }).sensitivity).toBe(3);
  expect(normalizePracticeSettings({ sensitivity: 0.01 }).sensitivity).toBe(0.3);
});

test("normalizePracticeSettings preserves last instrument and tune", () => {
  expect(normalizePracticeSettings({
    lastInstrument: "sn",
    lastTuneName: "Funk",
    lastPatternName: "Tune"
  })).toMatchObject({
    lastInstrument: "sn",
    lastTuneName: "Funk",
    lastPatternName: "Tune"
  });
});

test("normalizePracticeSettings preserves difficulty", () => {
  expect(normalizePracticeSettings({ difficulty: "hard" }).difficulty).toBe("hard");
});
