import { expect, it, test } from "vitest";
import { rmsOfBlock, createDetectorState, processBlock, MIN_NOISE_FLOOR, DEFAULT_DETECTOR_PARAMS, effectiveMultiplier } from "../onsetDetectorCore";

test("effectiveMultiplier trims the trigger inversely with user sensitivity", () => {
  expect(effectiveMultiplier(3, 1)).toBe(3);     // neutral
  expect(effectiveMultiplier(3, 3)).toBe(1);     // hottest (max sensitivity)
  expect(effectiveMultiplier(3, 0.3)).toBe(10);  // coldest (min sensitivity)
});

it("exposes the single source of host↔worklet detector defaults", () => {
  expect(DEFAULT_DETECTOR_PARAMS).toEqual({ multiplier: 3, refractoryFrames: 19, userSensitivity: 1 });
});

test("rmsOfBlock: silent block", () => {
  expect(rmsOfBlock(new Float32Array(128))).toBe(0);
});

test("rmsOfBlock: constant amplitude", () => {
  const block = new Float32Array(128).fill(0.5);
  expect(rmsOfBlock(block)).toBeCloseTo(0.5, 5);
});

test("processBlock: silent input never triggers", () => {
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 50 });
  for (let i = 0; i < 100; i++) {
    expect(processBlock(state, new Float32Array(128), i)).toBeNull();
  }
});

test("processBlock: loud transient on quiet baseline triggers", () => {
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });

  // Warm noise floor with quiet noise
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 200; i++) processBlock(state, quiet, i);

  // Loud transient
  const loud = new Float32Array(128).fill(0.5);
  const trigger = processBlock(state, loud, 200);
  expect(trigger).not.toBeNull();
  expect(trigger!.energy).toBeGreaterThan(0.4);
});

test("processBlock: sustained loud input fires once, not repeatedly, until energy falls back to the floor", () => {
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 50; i++) processBlock(state, quiet, i);
  const loud = new Float32Array(128).fill(0.5);
  // First loud block fires.
  expect(processBlock(state, loud, 50)).not.toBeNull();
  // Sustained loud must NOT re-fire — even long past the refractory window —
  // because energy never dropped back near the floor to re-arm the detector.
  // (A held tone is one event; re-firing it is the "extras" bug.)
  for (let i = 51; i < 200; i++) {
    expect(processBlock(state, loud, i)).toBeNull();
  }
  // A quiet gap re-arms the detector; the next loud block fires again.
  for (let i = 200; i < 210; i++) processBlock(state, quiet, i);
  expect(processBlock(state, loud, 210)).not.toBeNull();
});

test("processBlock: sustained elevated audio does not ratchet the noise floor", () => {
  // A resonant instrument keeps RMS well above ambient but below the trigger.
  // The floor must NOT learn from it (that positive feedback is what raised the
  // threshold above real hits and killed detection after a few loops).
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const sustained = new Float32Array(128).fill(0.05); // > floor×1.5 (0.0225), < old floor×4 (0.06)
  for (let i = 0; i < 500; i++) processBlock(state, sustained, i);
  expect(state.noiseFloor).toBe(MIN_NOISE_FLOOR);
});

test("processBlock: a real hit still fires after a stretch of sustained elevated audio", () => {
  // Because the floor was held (previous test), the trigger threshold stays sane
  // and a genuine hit after the sustained bed is still detected.
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const sustained = new Float32Array(128).fill(0.05);
  for (let i = 0; i < 500; i++) processBlock(state, sustained, i);
  // Brief quiet gap so the detector re-arms (the sustained block fired once at frame 0).
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 500; i < 510; i++) processBlock(state, quiet, i);
  const hit = new Float32Array(128).fill(0.1);
  expect(processBlock(state, hit, 510)).not.toBeNull();
});

test("processBlock: a single strike with a long decay tail produces exactly one onset", () => {
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 50; i++) processBlock(state, quiet, i);
  // One strike: an attack then a decay tail that stays above the trigger (0.045)
  // for many blocks — longer than the refractory window.
  const tail = [0.2, 0.15, 0.1, 0.08, 0.07, 0.06, 0.05, 0.048, 0.046];
  let fires = 0;
  tail.forEach((amp, k) => {
    if (processBlock(state, new Float32Array(128).fill(amp), 50 + k)) fires++;
  });
  expect(fires).toBe(1);
});

test("processBlock: a stroke re-arms on a dip below the trigger, even while energy stays above the noise floor", () => {
  // A resonant instrument only dips part-way between strokes: below the trigger
  // (floor×3 ≈ 0.045) but well above the floor's learn window (floor×1.5 ≈ 0.0225).
  // The detector must re-arm on that partial dip — otherwise sustained/resonant
  // instruments stop registering after the first hit (observed: ~2 of 9 detected).
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 50; i++) processBlock(state, quiet, i);
  const loud = new Float32Array(128).fill(0.2);
  const partialDip = new Float32Array(128).fill(0.03);
  expect(processBlock(state, loud, 50)).not.toBeNull(); // stroke 1
  for (let i = 51; i < 60; i++) processBlock(state, partialDip, i); // dips below trigger, not to floor
  expect(processBlock(state, loud, 60)).not.toBeNull(); // stroke 2 must still fire
});

test("processBlock: a weak secondary peak shortly after a strong hit is suppressed (decay tail)", () => {
  // The originating instrument (e.g. Low Surdo) rings: ~180 ms after the attack a
  // resonant bump re-crosses the trigger at a small fraction of the attack energy.
  // It belongs to the same notated stroke, so it must not count as a new onset.
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 50; i++) processBlock(state, quiet, i);
  expect(processBlock(state, new Float32Array(128).fill(0.8), 50)).not.toBeNull(); // strong attack
  for (let i = 51; i < 117; i++) processBlock(state, quiet, i); // energy dips (re-arms) ~180 ms
  expect(processBlock(state, new Float32Array(128).fill(0.07), 117)).toBeNull(); // weak resonant bump
});

test("processBlock: a strong stroke soon after another strong stroke is not suppressed", () => {
  // The decay gate keys off ENERGY, not time: a genuine next stroke of comparable
  // force must fire even when it lands close behind (fast playing, ~120 ms here).
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 50; i++) processBlock(state, quiet, i);
  expect(processBlock(state, new Float32Array(128).fill(0.8), 50)).not.toBeNull(); // stroke 1
  for (let i = 51; i < 95; i++) processBlock(state, quiet, i);
  expect(processBlock(state, new Float32Array(128).fill(0.8), 95)).not.toBeNull(); // stroke 2
});

test("processBlock: a weak onset long after a hit fires once the decay gate has relaxed", () => {
  // The gate is temporary, not a permanent raised threshold.
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 50; i++) processBlock(state, quiet, i);
  expect(processBlock(state, new Float32Array(128).fill(0.8), 50)).not.toBeNull();
  for (let i = 51; i < 170; i++) processBlock(state, quiet, i); // past the decay-gate window
  expect(processBlock(state, new Float32Array(128).fill(0.07), 170)).not.toBeNull();
});

test("processBlock: two separate strokes with a quiet dip between them both fire", () => {
  // Guards that the re-arm gate does not suppress genuinely distinct strokes:
  // energy returns to the floor between them, so the second one re-arms and fires.
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5 });
  const quiet = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 50; i++) processBlock(state, quiet, i);
  const loud = new Float32Array(128).fill(0.2);
  expect(processBlock(state, loud, 50)).not.toBeNull(); // stroke 1
  for (let i = 51; i < 56; i++) processBlock(state, quiet, i); // dip back to the floor
  expect(processBlock(state, loud, 56)).not.toBeNull(); // stroke 2
});

test("processBlock: respects noiseFloorInit", () => {
  // Higher initial floor than default — the same quiet input that triggers with
  // the default 0.001 floor should now be sub-threshold.
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5, noiseFloorInit: 1.0 });
  const moderate = new Float32Array(128).fill(0.1);
  expect(processBlock(state, moderate, 0)).toBeNull();
});

test("createDetectorState: initial floor below MIN_NOISE_FLOOR is bumped up", () => {
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5, noiseFloorInit: 0.0001 });
  expect(state.noiseFloor).toBe(MIN_NOISE_FLOOR);
});

test("processBlock: adaptive floor stays clamped at MIN_NOISE_FLOOR under prolonged silence", () => {
  // Start the floor above the clamp; let it decay against very quiet input. Without the clamp
  // it would settle near the input RMS (~0.0001); with the clamp it should park at MIN_NOISE_FLOOR.
  const state = createDetectorState({ multiplier: 3, refractoryFrames: 5, noiseFloorInit: 0.1 });
  const silent = new Float32Array(128).fill(0.0001);
  for (let i = 0; i < 10000; i++) processBlock(state, silent, i);
  expect(state.noiseFloor).toBe(MIN_NOISE_FLOOR);
});
