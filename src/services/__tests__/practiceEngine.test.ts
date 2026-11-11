import { expect, test, vi } from "vitest";
import { createPracticeEngine, PracticeEngineOpts } from "../practiceEngine";
import { normalizePattern } from "../../state/pattern";
import type Beatbox from "beatbox.js";
import type { BeatboxReference } from "../player";

// Prevent player.ts module-level AudioContext side-effects from running in happy-dom.
// patternToBeatbox is replaced with a no-op stub; createBeatbox/getPlayerById are
// never called directly in tests since all tests inject beatboxFactory.
vi.mock("../player", () => ({
  createBeatbox: vi.fn(),
  getPlayerById: vi.fn(),
  patternToBeatbox: vi.fn(() => []),
  stopAllPlayers: vi.fn(),
}));

function makeFakeBeatbox(): { ref: BeatboxReference; player: Beatbox } {
  const player = {
    setPattern: vi.fn(),
    setBeatLength: vi.fn(),
    setRepeat: vi.fn(),
    on: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
    off: vi.fn(),
  } as unknown as Beatbox;
  const ref: BeatboxReference = { id: -1, playing: false, customPosition: false };
  return { ref, player };
}

function makeDefaultOpts(): PracticeEngineOpts {
  return {
    beatboxFactory: () => makeFakeBeatbox(),
  };
}

test("engine starts in Idle", () => {
  const engine = createPracticeEngine({
    micPermission: { state: { value: "unknown" } as any, request: async () => ({} as any), release: () => {} },
    detector: { start: async () => {}, stop: async () => {}, setSensitivity: () => {}, on: () => {}, off: () => {} },
  });
  expect(engine.state.value).toBe("idle");
});

function makeDeps(grant = true) {
  const stream = {} as MediaStream;
  return {
    micPermission: {
      state: { value: grant ? "granted" : "unknown" } as any,
      request: vi.fn(grant ? async () => stream : async () => { throw new Error("denied"); }),
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

function makeDefaultConfig() {
  return {
    pattern: normalizePattern({ length: 1, time: 4, sn: ["X", ".", "X", "."] }),
    instrument: "sn" as const,
    speedBpm: 120,
    mode: "instrument" as const,
  };
}

test("start() transitions to requestingMic then countIn on grant", async () => {
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  const promise = engine.start();
  expect(engine.state.value).toBe("requestingMic");
  await promise;
  expect(engine.state.value).toBe("countIn");
  expect(deps.detector.start).toHaveBeenCalled();
});

test("stats during countIn reports zero misses (no loop baseline yet)", async () => {
  // Regression for Bug: the score rail showed a full loop's worth of misses the
  // instant a session started. During count-in loopBaselinePerf is still null, so
  // the engine must report 0 elapsed (loop not started) — not "unknown", which the
  // scorer treats as "count the whole loop". With no hits and no time elapsed,
  // nothing can yet be missed.
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig()); // pattern has 2 strokes (X . X .)
  await engine.start();
  expect(engine.state.value).toBe("countIn");
  expect(engine.stats().hits).toBe(0);
  expect(engine.stats().misses).toBe(0);
});

test("start() denied returns to idle", async () => {
  const deps = makeDeps(false);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  await engine.start().catch(() => {});
  expect(engine.state.value).toBe("idle");
});

test("stop() resets to idle and cleans up", async () => {
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  await engine.start();
  await engine.stop();
  expect(engine.state.value).toBe("idle");
  expect(deps.micPermission.release).toHaveBeenCalled();
  expect(deps.detector.stop).toHaveBeenCalled();
});

test("start() is a no-op when not idle or results", async () => {
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  await engine.start(); // → countIn
  expect(engine.state.value).toBe("countIn");
  await engine.start(); // guard should early-return
  // Mic was requested only once; second start() did not re-request
  expect(deps.micPermission.request).toHaveBeenCalledTimes(1);
});

test("countIn completes and transitions to gameOn after configured ms", async () => {
  const deps = makeDeps(true);
  const fakeTimer = {
    setTimeout: (cb: () => void, _ms: number) => { queueMicrotask(cb); return 0 as any; },
    clearTimeout: () => {},
  };
  const engine = createPracticeEngine(deps, { timer: fakeTimer as any, beatboxFactory: () => makeFakeBeatbox() });
  engine.configure(makeDefaultConfig());
  await engine.start();
  expect(engine.state.value).toBe("countIn");
  await engine.advanceToGameOn();
  expect(engine.state.value).toBe("gameOn");
});

test("stopGame() transitions from gameOn through finalising to results", async () => {
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  await engine.start();
  await engine.advanceToGameOn();
  await engine.stopGame();
  expect(engine.state.value).toBe("results");
});

test("stop() during finalising cancels stopGame's transition to results", async () => {
  const deps = makeDeps(true);
  let resolveDelay!: () => void;
  const fakeTimer = {
    setTimeout: (cb: () => void, _ms: number) => {
      resolveDelay = cb;
      return 0 as any;
    },
    clearTimeout: () => {},
  };
  const engine = createPracticeEngine(deps, { timer: fakeTimer as any, beatboxFactory: () => makeFakeBeatbox() });
  engine.configure(makeDefaultConfig());
  await engine.start();
  await engine.advanceToGameOn();
  const stopGamePromise = engine.stopGame(); // enters finalising, awaits delay
  await engine.stop();                       // → idle (during finalising)
  resolveDelay();                            // delay fires AFTER stop()
  await stopGamePromise;
  expect(engine.state.value).toBe("idle");   // guard prevented overwrite to "results"
});

test("advanceToGameOn() is a no-op from non-countIn states", async () => {
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  // From idle — should not transition
  await engine.advanceToGameOn();
  expect(engine.state.value).toBe("idle");
  // After full lifecycle: idle → countIn → gameOn → already gameOn, second call no-op
  await engine.start();
  await engine.advanceToGameOn();
  expect(engine.state.value).toBe("gameOn");
  await engine.advanceToGameOn();           // second call from gameOn
  expect(engine.state.value).toBe("gameOn"); // unchanged
});

test("engine pipes detected hits into the scorer after gameOn", async () => {
  const deps = makeDeps(true);
  // Capture the onset subscriber to drive it manually
  let onsetSub: ((e: any) => void) | null = null;
  deps.detector.on = vi.fn((ev: string, cb: any) => { if (ev === "onset") onsetSub = cb; });

  const pattern = normalizePattern({ length: 1, time: 4, sn: ["X", ".", "X", "."] });

  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure({ pattern, instrument: "sn", speedBpm: 120, mode: "instrument" });
  await engine.start();

  // The fake Beatbox's "stop" handler is a vi.fn() — registered but never invoked.
  // So onCountInComplete never fires and the main Beatbox isn't created.
  // Inject an explicit loop baseline directly to drive the scorer.
  const baselinePerf = 1000; // arbitrary
  await engine.advanceToGameOn(baselinePerf);

  // Strokes are at t=0 and t=250ms in loop-relative time (120 bpm × 4 strokes/beat → 125ms/stroke).
  // Send an onset at baseline + 250ms — should land on the second expected hit.
  onsetSub!({ t_perf: baselinePerf + 250, energy: 0.5 });

  await engine.stopGame();
  expect(engine.stats().hits).toBeGreaterThanOrEqual(1);
});

test("verdicts(): an on-time hit shows a good verdict on its stroke", async () => {
  const deps = makeDeps(true);
  let onsetSub: ((e: any) => void) | null = null;
  deps.detector.on = vi.fn((ev: string, cb: any) => { if (ev === "onset") onsetSub = cb; });

  const pattern = normalizePattern({ length: 1, time: 4, sn: ["X", ".", "X", "."] });
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure({ pattern, instrument: "sn", speedBpm: 120, mode: "instrument" });
  await engine.start();
  await engine.advanceToGameOn(1000);
  onsetSub!({ t_perf: 1000, energy: 0.5 }); // stroke 0, on time
  expect(engine.verdicts().perStroke.get(0)?.verdict).toBe("good");
});

test("difficulty scales the scoring tolerance threaded into the timeline", async () => {
  const deps = makeDeps(true);
  let onsetSub: ((e: any) => void) | null = null;
  deps.detector.on = vi.fn((ev: string, cb: any) => { if (ev === "onset") onsetSub = cb; });

  const pattern = normalizePattern({ length: 1, time: 4, sn: ["X", ".", "X", "."] });
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure({ pattern, instrument: "sn", speedBpm: 120, mode: "instrument", difficulty: "hard" });
  await engine.start();

  const baselinePerf = 1000;
  await engine.advanceToGameOn(baselinePerf);

  // Stroke at t=250ms; hit is 50ms late. Normal good=60 → "good"; Hard good=36 → "off".
  onsetSub!({ t_perf: baselinePerf + 300, energy: 0.5 });

  // strokeIdx 2 is at t=250ms (index 2 in ["X",".",X","."]) — 50ms late → "off" under hard.
  const v = engine.verdicts().perStroke.get(2);
  expect(v?.verdict).toBe("off");
});

test("changing difficulty during gameOn resets to idle", async () => {
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  const cfg = {
    pattern: normalizePattern({ length: 1, time: 4, sn: ["X"] }),
    instrument: "sn" as const, speedBpm: 120, mode: "instrument" as const, difficulty: "easy" as const,
  };
  engine.configure(cfg);
  await engine.start();
  await engine.advanceToGameOn();
  engine.configure({ ...cfg, difficulty: "hard" });
  expect(engine.state.value).toBe("idle");
});

function makePositionedBeatboxFactory() {
  // Beatbox factory that captures `on(ev, cb)` per instance, allowing tests to
  // drive "play"/"beat"/"stop" with explicit arguments (notably beat positions).
  type Handlers = {
    play?: () => void;
    beat?: (position: number) => void;
    stop?: () => void;
  };
  const beatboxes: Array<{
    handlers: Handlers;
    player: Beatbox;
    ref: BeatboxReference;
  }> = [];
  const factory = (_repeat: boolean) => {
    const handlers: Handlers = {};
    const player = {
      setPattern: vi.fn(),
      setBeatLength: vi.fn(),
      setRepeat: vi.fn(),
      on: vi.fn((ev: keyof Handlers, cb: never) => { handlers[ev] = cb; }),
      play: vi.fn(),
      stop: vi.fn(),
      off: vi.fn(),
    } as unknown as Beatbox;
    const ref: BeatboxReference = { id: -1, playing: false, customPosition: false };
    beatboxes.push({ handlers, player, ref });
    return { ref, player };
  };
  return { factory, beatboxes };
}

test("does not wrap on a warm-up beat with a garbage position before a full loop elapses", async () => {
  // Regression: a brand-new AudioContext can report a garbage-large beat position before its
  // output clock settles (live trace observed 7373, then a snap back to 0, ~15ms into the
  // session). That snap-back looks like a loop-boundary position decrease, but only ~15ms has
  // elapsed — far less than a loop — so the wrap's elapsed-time guard must reject it. Otherwise it
  // pushes a full empty loop into the scorer → a loop's worth of phantom misses with zero input.
  const deps = makeDeps(true);
  const { factory, beatboxes } = makePositionedBeatboxFactory();
  let mockNow = 1000;
  const engine = createPracticeEngine(deps, { beatboxFactory: factory, now: () => mockNow });
  engine.configure(makeDefaultConfig()); // loopLengthMs = 500 (120bpm × 4 strokes/beat × 1 beat)

  const loopWrapSpy = vi.fn();
  engine.on("loopWrap", loopWrapSpy);

  await engine.start();
  beatboxes[0].handlers.stop?.();   // count-in done → onCountInComplete builds the main player
  await Promise.resolve();
  expect(beatboxes.length).toBeGreaterThanOrEqual(2);

  beatboxes[1].handlers.play?.();   // loop baseline anchored at mockNow = 1000
  mockNow = 1015;                   // 15ms in — audio clock still warming up
  beatboxes[1].handlers.beat?.(7373); // garbage warm-up position
  mockNow = 1019;
  beatboxes[1].handlers.beat?.(0);  // clock settles, position snaps to 0 (looks like a decrease)

  expect(loopWrapSpy).not.toHaveBeenCalled();
  expect(engine.stats().misses).toBe(0);
});

test("loop baseline tracks the audio wrap and does not drift over many loops", async () => {
  // Regression for the drift introduced by time-based wrap detection (fix #4): re-anchoring the
  // baseline to elapsed time (now()) at each wrap accumulated the per-loop overshoot, dragging the
  // baseline progressively later so every hit read earlier and earlier (all eventually scored
  // "off"/early; latency offset — a constant shift — couldn't compensate a growing error). The
  // baseline must follow the real audio loop wrap (position decrease), staying within ~one beat of
  // each true boundary rather than drifting hundreds of ms over a session.
  const deps = makeDeps(true);
  const { factory, beatboxes } = makePositionedBeatboxFactory();
  const B = 10_000;
  let mockNow = B;
  const engine = createPracticeEngine(deps, { beatboxFactory: factory, now: () => mockNow });
  engine.configure(makeDefaultConfig()); // loopLengthMs = 500
  const L = 500;
  const beatMs = 30; // beat cadence — deliberately does NOT divide L, so a late wrap overshoots

  await engine.start();
  beatboxes[0].handlers.stop?.();
  await Promise.resolve();
  const main = beatboxes[1].handlers;

  mockNow = B;
  main.play?.(); // baseline anchored at the true start B

  const STROKE_MS = 125; // L / strokes-per-loop (500 / 4); production reports a floored stroke index, not a per-mille
  const LOOPS = 8;
  // Feed beats at a fixed cadence; position is derived from the true audio loop phase, so it
  // decreases (wraps high→0) exactly at each true boundary B + k*L.
  for (let t = B + beatMs; t <= B + LOOPS * L + L; t += beatMs) {
    const phase = (t - B) % L;                         // 0..L-1
    const position = Math.floor(phase / STROKE_MS);    // stroke index 0..3 (upbeat 0); resets to 0 at each boundary
    mockNow = t;
    main.beat?.(position);
  }

  const baseline = engine.debugLoopBaseline()!;
  const r = ((baseline - B) % L + L) % L;
  const distFromGrid = Math.min(r, L - r); // how far the baseline sits from the nearest true boundary
  expect(distFromGrid).toBeLessThanOrEqual(beatMs);
});

test("engine emits 'loopWrap' on the audio loop wrap (position decrease)", async () => {
  // A wrap is the audio loop boundary: the beat position climbs through the loop, then drops back.
  // (A decrease before half a loop has elapsed is the warm-up transient and is rejected — see the
  // garbage-position test above.)
  const deps = makeDeps(true);
  const { factory, beatboxes } = makePositionedBeatboxFactory();
  let mockNow = 1000;
  const engine = createPracticeEngine(deps, { beatboxFactory: factory, now: () => mockNow });
  engine.configure(makeDefaultConfig()); // loopLengthMs = 500

  const loopWrapSpy = vi.fn();
  engine.on("loopWrap", loopWrapSpy);

  await engine.start();
  beatboxes[0].handlers.stop?.();  // count-in done → onCountInComplete builds main
  await Promise.resolve();
  expect(beatboxes.length).toBeGreaterThanOrEqual(2);

  beatboxes[1].handlers.play?.();              // loop baseline = 1000
  mockNow = 1200; beatboxes[1].handlers.beat?.(1); // climbing within loop 1 (stroke index 1)
  mockNow = 1450; beatboxes[1].handlers.beat?.(3); // still climbing (stroke index 3)
  expect(loopWrapSpy).not.toHaveBeenCalled();
  mockNow = 1510; beatboxes[1].handlers.beat?.(0);   // position dropped → wrapped (elapsed 510 ≥ 250)
  expect(loopWrapSpy).toHaveBeenCalledTimes(1);
});

test("re-anchors to the wrap and fires once per loop, not on every beat", async () => {
  const deps = makeDeps(true);
  const { factory, beatboxes } = makePositionedBeatboxFactory();
  let mockNow = 1000;
  const engine = createPracticeEngine(deps, { beatboxFactory: factory, now: () => mockNow });
  engine.configure(makeDefaultConfig()); // loopLengthMs = 500

  const loopWrapSpy = vi.fn();
  engine.on("loopWrap", loopWrapSpy);

  await engine.start();
  beatboxes[0].handlers.stop?.();
  await Promise.resolve();
  const main = beatboxes[1].handlers;

  main.play?.();                       // baseline = 1000
  mockNow = 1450; main.beat?.(3);      // climbing (stroke index 3)
  mockNow = 1510; main.beat?.(0);      // wrap #1 (decrease, elapsed 510 ≥ 250)
  expect(loopWrapSpy).toHaveBeenCalledTimes(1);
  // Positions climbing again within loop 2 must NOT re-wrap.
  mockNow = 1700; main.beat?.(1);
  mockNow = 1950; main.beat?.(3);
  expect(loopWrapSpy).toHaveBeenCalledTimes(1);
  mockNow = 2015; main.beat?.(0);      // next boundary (decrease, elapsed since 1510 = 505 ≥ 250) → wrap #2
  expect(loopWrapSpy).toHaveBeenCalledTimes(2);
});

test("stop() detaches the main player's listeners so a stale beat can't reach a later session's scorer", async () => {
  // Hygiene/defense-in-depth: teardown() stops the players but used to leave the main player's
  // "play"/"beat" listeners attached. Those closures reference the module-level scorer, so a late
  // beat from a previous session's closing AudioContext could reach a *new* session's scorer.
  const deps = makeDeps(true);
  const { factory, beatboxes } = makePositionedBeatboxFactory();
  const engine = createPracticeEngine(deps, { beatboxFactory: factory });
  engine.configure(makeDefaultConfig());

  await engine.start();
  beatboxes[0].handlers.stop?.();   // count-in done → onCountInComplete builds the main player
  await Promise.resolve();
  expect(beatboxes.length).toBeGreaterThanOrEqual(2);
  const mainPlayer = beatboxes[1].player;

  await engine.stop();              // teardown() must remove the main player's listeners

  expect(mainPlayer.off).toHaveBeenCalledWith("play", expect.any(Function));
  expect(mainPlayer.off).toHaveBeenCalledWith("beat", expect.any(Function));
});

test("engine.off() removes the listener", async () => {
  const deps = makeDeps(true);
  let onsetSub: ((e: any) => void) | null = null;
  deps.detector.on = vi.fn((ev: string, cb: any) => { if (ev === "onset") onsetSub = cb; });

  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  await engine.start();

  const spy = vi.fn();
  engine.on("verdictsChanged", spy);
  engine.off("verdictsChanged", spy);

  const baselinePerf = 1000;
  await engine.advanceToGameOn(baselinePerf);
  onsetSub!({ t_perf: baselinePerf + 250, energy: 0.5 });

  expect(spy).not.toHaveBeenCalled();
});

test("verdicts(): an early downbeat matches stroke 0 across the wrap", async () => {
  const deps = makeDeps(true);
  let onsetSub: ((e: any) => void) | null = null;
  deps.detector.on = vi.fn((ev: string, cb: any) => { if (ev === "onset") onsetSub = cb; });
  const pattern = normalizePattern({ length: 1, time: 4, sn: ["X", ".", "X", "."] });
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure({ pattern, instrument: "sn", speedBpm: 120, mode: "instrument" });
  await engine.start();
  await engine.advanceToGameOn(1000);
  onsetSub!({ t_perf: 1000 - 20, energy: 0.5 }); // 20ms early → raw tRel −20, matches stroke 0 (no modulo)
  expect(engine.verdicts().perStroke.get(0)).toMatchObject({ verdict: "good", delta: -20 });
});

test("verdictsChanged fires on each onset", async () => {
  const deps = makeDeps(true);
  let onsetSub: ((e: any) => void) | null = null;
  deps.detector.on = vi.fn((ev: string, cb: any) => { if (ev === "onset") onsetSub = cb; });
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure(makeDefaultConfig());
  await engine.start();
  await engine.advanceToGameOn(1000);
  const spy = vi.fn();
  engine.on("verdictsChanged", spy);
  onsetSub!({ t_perf: 1000, energy: 0.5 });
  expect(spy).toHaveBeenCalled();
});

test("configure() during gameOn forces a reset to idle", async () => {
  const deps = makeDeps(true);
  const engine = createPracticeEngine(deps, makeDefaultOpts());
  engine.configure({
    pattern: normalizePattern({ length: 1, time: 4, sn: ["X"] }),
    instrument: "sn", speedBpm: 120, mode: "instrument",
  });
  await engine.start();
  await engine.advanceToGameOn();
  engine.configure({
    pattern: normalizePattern({ length: 1, time: 4, sn: ["X"] }),
    instrument: "ls", speedBpm: 120, mode: "instrument",
  });
  expect(engine.state.value).toBe("idle");
});
