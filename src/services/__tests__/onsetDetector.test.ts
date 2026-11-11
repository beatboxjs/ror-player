import { expect, test } from "vitest";
import { ctxTimeToPerfTime } from "../onsetDetector";

test("ctxTimeToPerfTime converts via an output-timestamp snapshot", () => {
  // Snapshot: at perf=10000ms, audio ctx was at 5.123s.
  // A subsequent onset at ctx=5.223s → perf = 10000 + (5.223 - 5.123) * 1000 = 10100ms
  const snap = { contextTime: 5.123, performanceTime: 10000 };
  expect(ctxTimeToPerfTime(5.223, snap)).toBeCloseTo(10100, 5);
});
