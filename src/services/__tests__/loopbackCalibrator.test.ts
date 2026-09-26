import { expect, test } from "vitest";
import { createLoopbackCalibration, DEFAULT_LOOPBACK_QUALITY } from "../loopbackCalibrator";

function beatsAt(n: number, spacingMs: number, start = 100_000): number[] {
  return Array.from({ length: n }, (_, i) => start + i * spacingMs);
}

test("recovers a known constant latency", () => {
  const beats = beatsAt(11, 600);
  const cal = createLoopbackCalibration(beats);
  for (const b of beats) cal.recordOnset(b + 40);
  const r = cal.finalize();
  expect(r.medianMs).toBe(40);
  expect(r.spread).toBe(0);
  expect(r.count).toBe(11);
  expect(r.accepted).toBe(true);
  expect(r.reason).toBeUndefined();
});

test("accepts a latency with small jitter", () => {
  const beats = beatsAt(11, 600);
  const cal = createLoopbackCalibration(beats);
  const jitter = [0, 5, -5, 8, -8, 3, -3, 6, -6, 2, -2];
  beats.forEach((b, i) => cal.recordOnset(b + 40 + jitter[i]));
  const r = cal.finalize();
  expect(r.accepted).toBe(true);
  expect(Math.abs(r.medianMs - 40)).toBeLessThanOrEqual(5);
});

test("rejects too-few detections", () => {
  const beats = beatsAt(11, 600);
  const cal = createLoopbackCalibration(beats);
  cal.recordOnset(beats[0] + 40);
  cal.recordOnset(beats[1] + 40);
  cal.recordOnset(beats[2] + 40);
  const r = cal.finalize();
  expect(r.count).toBe(3);
  expect(r.accepted).toBe(false);
  expect(r.reason).toBe("too-few");
});

test("rejects too-noisy spread", () => {
  const beats = beatsAt(11, 600);
  const cal = createLoopbackCalibration(beats);
  const deltas = [0, 10, 5, 15, 8, 200, 195, 205, 190, 210, 100];
  beats.forEach((b, i) => cal.recordOnset(b + deltas[i]));
  const r = cal.finalize();
  expect(r.count).toBe(11);
  expect(r.accepted).toBe(false);
  expect(r.reason).toBe("too-noisy");
});

test("marginal spread band sits strictly inside the accept band", () => {
  expect(DEFAULT_LOOPBACK_QUALITY.marginalSpread).toBeLessThan(DEFAULT_LOOPBACK_QUALITY.maxSpread);
});

test("ignores onsets outside the match window", () => {
  const beats = beatsAt(11, 600);
  const cal = createLoopbackCalibration(beats);
  for (const b of beats) cal.recordOnset(b + 40);
  cal.recordOnset(beats[beats.length - 1] + 400); // beyond the last beat + window → ignored
  const r = cal.finalize();
  expect(r.count).toBe(11);
  expect(r.medianMs).toBe(40);
});
