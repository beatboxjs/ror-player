import { expect, test } from "vitest";
import { computeMedianAndSpread, createCalibrationSession } from "../latencyCalibrator";

test("computeMedianAndSpread: empty input", () => {
  expect(computeMedianAndSpread([])).toEqual({ median: 0, spread: 0, count: 0 });
});

test("computeMedianAndSpread: single value", () => {
  expect(computeMedianAndSpread([42])).toEqual({ median: 42, spread: 0, count: 1 });
});

test("computeMedianAndSpread: odd count", () => {
  expect(computeMedianAndSpread([10, 20, 30])).toEqual({
    median: 20, spread: 10, count: 3, // spread = MAD: median of |v − 20| = median([10, 0, 10]) = 10
  });
});

test("computeMedianAndSpread: even count averages middle two", () => {
  expect(computeMedianAndSpread([10, 20, 30, 40])).toEqual({
    median: 25, spread: 10, count: 4,
  });
});

test("calibration session collects deltas against scheduled beats", () => {
  const beats = [0, 500, 1000, 1500]; // 4 beats, 500ms apart
  const session = createCalibrationSession(beats);
  session.recordTap(50);    // 50ms after beat 0
  session.recordTap(548);   // 48ms after beat 1 (closest)
  session.recordTap(1051);  // 51ms after beat 2
  session.recordTap(1547);  // 47ms after beat 3
  const result = session.finalize();
  expect(result.count).toBe(4);
  expect(result.median).toBe(49);
  expect(result.spread).toBeLessThanOrEqual(2);
});

test("calibration session ignores taps outside any beat's window", () => {
  const beats = [0, 500];
  const session = createCalibrationSession(beats, { windowMs: 200 });
  session.recordTap(100);   // within window of beat 0
  session.recordTap(5000);  // far away — dropped
  expect(session.finalize().count).toBe(1);
});

test("calibration session records negative delta for tap before beat", () => {
  const session = createCalibrationSession([500]);
  session.recordTap(450); // 50ms before beat
  expect(session.finalize().median).toBe(-50);
});

test("calibration session finalize with no taps returns zeros", () => {
  const session = createCalibrationSession([0, 500, 1000]);
  expect(session.finalize()).toEqual({ median: 0, spread: 0, count: 0 });
});
