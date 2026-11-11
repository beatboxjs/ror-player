import { expect, test, vi } from "vitest";
import { createPracticeEngine, PracticeConfig, PracticeEngineOpts } from "../practiceEngine";
import { buildExpectedTimeline, ExpectedHit, SessionStats } from "../practiceScorer";
import { normalizePattern } from "../../state/pattern";
import type Beatbox from "beatbox.js";
import type { BeatboxReference } from "../player";

// Golden end-to-end timing test. We synthesize the exact onset stream a perfect
// (or deliberately imperfect) player would produce for a known partition, feed it
// through the REAL engine timing path (perf-time → loop-relative, plus the
// latencyOffsetMs correction), and assert what avg|Δ| and drift come out.
//
// This is the oracle for "is the app counting the right latency?". The engine
// inverts time:  tRel = (t_perf - latencyOffsetMs) - baseline.  synthesizeOnsets
// below must therefore model how time is actually PRODUCED in the world, so the
// reported delta is exactly  playerError + (acousticLatency - latencyOffsetMs).

vi.mock("../player", () => ({
  createBeatbox: vi.fn(),
  getPlayerById: vi.fn(),
  patternToBeatbox: vi.fn(() => []),
  stopAllPlayers: vi.fn(),
}));

const BASELINE = 100_000; // fake loop-baseline perf time; any constant works

function makeFakeBeatbox(): { ref: BeatboxReference; player: Beatbox } {
  const player = {
    setPattern: vi.fn(),
    setBeatLength: vi.fn(),
    setRepeat: vi.fn(),
    on: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
  } as unknown as Beatbox;
  const ref: BeatboxReference = { id: -1, playing: false, customPosition: false };
  return { ref, player };
}

function makeDeps() {
  const stream = {} as MediaStream;
  return {
    micPermission: {
      state: { value: "granted" } as any,
      request: vi.fn(async () => stream),
      release: vi.fn(),
    } as any,
    detector: {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {}),
      setSensitivity: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    } as any,
  };
}

function makeConfig(snLine: string[]): PracticeConfig {
  return {
    pattern: normalizePattern({ length: 1, time: 4, sn: snLine }),
    instrument: "sn",
    speedBpm: 120, // → 125 ms/stroke, loop = 500 ms
    mode: "instrument",
  };
}

/**
 * Drive a full session deterministically: configure → start → gameOn(BASELINE),
 * feed the given perf-time onsets, then read live stats (un-finalised, so it
 * matches against the full expected timeline with no tail-trimming).
 */
async function runSession(
  config: PracticeConfig,
  feedTimes: number[],
  opts: PracticeEngineOpts = {},
): Promise<SessionStats> {
  let onsetSub: ((e: { t_perf: number; energy: number }) => void) | null = null;
  const deps = makeDeps();
  deps.detector.on = vi.fn((ev: string, cb: any) => { if (ev === "onset") onsetSub = cb; });

  const engine = createPracticeEngine(deps, { beatboxFactory: () => makeFakeBeatbox(), ...opts });
  engine.configure(config);
  await engine.start();              // → countIn (count-in beatbox never fires "stop" here)
  await engine.advanceToGameOn(BASELINE); // → gameOn with an explicit loop baseline

  for (const t of feedTimes) onsetSub!({ t_perf: t, energy: 0.5 });
  // The session uses a synthetic loop baseline (BASELINE), so make "now" consistent
  // with it — far enough past it that every stroke's scoring window has closed and
  // live stats match the full expected timeline.
  const nowSpy = vi.spyOn(performance, "now").mockReturnValue(BASELINE + 10_000_000);
  const result = engine.stats();
  nowSpy.mockRestore();
  return result;
}

// Physics model: one perf-time onset per expected hit. The player strikes at the
// hit's scheduled loop time (+ their own timing error), and the sound arrives at
// the mic acousticLatencyMs LATER — so both terms add to wall-clock perf time.
// The engine later subtracts latencyOffsetMs to correct for that latency.
function synthesizeOnsets(
  expected: ExpectedHit[],
  baselinePerf: number,
  acousticLatencyMs: number,
  playerErrorMs: (hit: ExpectedHit, i: number) => number,
): number[] {
  return expected.map(
    (hit, i) => baselinePerf + hit.t + playerErrorMs(hit, i) + acousticLatencyMs,
  );
}

test("perfect player, zero latency → drift 0, avg|Δ| 0, full score", async () => {
  const config = makeConfig(["X", ".", "X", "."]); // strokes at 0 ms and 250 ms
  const { expected } = buildExpectedTimeline(config.pattern, "sn", 120);

  const feed = synthesizeOnsets(expected, BASELINE, 0, () => 0);
  const stats = await runSession(config, feed);

  expect(stats.hits).toBe(2);
  expect(stats.misses).toBe(0);
  expect(stats.extras).toBe(0);
  expect(stats.meanAbsDelta).toBe(0);
  expect(stats.drift).toBe(0);
  expect(stats.headlineScore).toBe(100);
});

test("perfect player, UNcalibrated 40 ms mic latency → surfaces as +40 drift", async () => {
  // The mic adds 40 ms but the app's latencyOffsetMs is still 0, so the 40 ms is
  // uncorrected. A flawless performance therefore reports pure +40 ms drift.
  const config = makeConfig(["X", ".", "X", "."]);
  const { expected } = buildExpectedTimeline(config.pattern, "sn", 120);

  const feed = synthesizeOnsets(expected, BASELINE, 40, () => 0);
  const stats = await runSession(config, feed); // latencyOffsetMs defaults to 0

  expect(stats.hits).toBe(2);          // 40 ms < good window (60) → still matched
  expect(stats.drift).toBe(40);
  expect(stats.meanAbsDelta).toBe(40);
});

test("calibrating latencyOffsetMs to the real latency cancels the drift", async () => {
  const config = makeConfig(["X", ".", "X", "."]);
  const { expected } = buildExpectedTimeline(config.pattern, "sn", 120);

  const feed = synthesizeOnsets(expected, BASELINE, 40, () => 0);
  const stats = await runSession(config, feed, { latencyOffsetMs: 40 });

  expect(stats.drift).toBe(0);
  expect(stats.meanAbsDelta).toBe(0);
});

test("latencyOffsetMs as a live getter cancels the drift just like a static number", async () => {
  const config = makeConfig(["X", ".", "X", "."]);
  const { expected } = buildExpectedTimeline(config.pattern, "sn", 120);
  const feed = synthesizeOnsets(expected, BASELINE, 40, () => 0);
  const stats = await runSession(config, feed, { latencyOffsetMs: () => 40 }); // function form
  expect(stats.drift).toBe(0);
  expect(stats.meanAbsDelta).toBe(0);
});

test("random sloppiness inflates avg|Δ| but leaves drift ≈ 0", async () => {
  // Strokes at 125 ms and 375 ms (kept away from the loop edges so the ±20 ms
  // jitter can't wrap across the loop boundary). Early and late cancel in drift.
  const config = makeConfig([".", "X", ".", "X"]);
  const { expected } = buildExpectedTimeline(config.pattern, "sn", 120);

  const feed = synthesizeOnsets(expected, BASELINE, 0, (_h, i) => (i % 2 === 0 ? +20 : -20));
  const stats = await runSession(config, feed);

  expect(stats.drift).toBe(0);
  expect(stats.meanAbsDelta).toBe(20);
});
