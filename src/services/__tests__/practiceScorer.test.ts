import { expect, test } from "vitest";
import { SILENT_STROKES, buildExpectedTimeline, matchHits, DEFAULT_TOLERANCE, scoreSession, createScorer, deltaToPosition, toleranceForDifficulty, extraStrokeIdx } from "../practiceScorer";
import { normalizePattern } from "../../state/pattern";

test("SILENT_STROKES matches the documented set", () => {
  expect(SILENT_STROKES).toEqual(new Set([" ", "", ".", "s"]));
});

test("buildExpectedTimeline handles an empty pattern", () => {
  const pattern = normalizePattern({ length: 4, time: 4 });
  const tl = buildExpectedTimeline(pattern, "sn", 120);
  expect(tl.expected).toEqual([]);
  expect(tl.loopLengthMs).toBe(60_000 / 120 * 4); // 2000 ms
});

test("buildExpectedTimeline derives expected hits from snare line", () => {
  const pattern = normalizePattern({
    length: 1, time: 4, sn: ["X", ".", "X", "."]
  });
  const tl = buildExpectedTimeline(pattern, "sn", 120);
  const strokeMs = 60_000 / (120 * 4); // 125 ms
  expect(tl.expected).toEqual([
    { strokeIdx: 0, t: 0 },
    { strokeIdx: 2, t: 2 * strokeMs }
  ]);
});

test("buildExpectedTimeline aligns strokeIdx with the upbeat-adjusted partition cells", () => {
  // upbeat=1 with an empty pickup slot (like real Low Surdo lines): the array is
  // [pickup, main…] so raw index 0 is the pickup and the main downbeat is raw index 1.
  // PatternPlayer labels the cell at raw index `i` as `stroke-i-${i - upbeat}`, and the
  // engine anchors loopBaselinePerf at raw index 0, so expected `t` stays raw-indexed.
  const pattern = normalizePattern({
    length: 1, time: 4, upbeat: 1, sn: [" ", "X", ".", ".", "X"]
  });
  const tl = buildExpectedTimeline(pattern, "sn", 120);
  const strokeMs = 60_000 / (120 * 4); // 125 ms
  expect(tl.expected).toEqual([
    { strokeIdx: 0, t: 1 * strokeMs },  // first main stroke: cell stroke-i-0, not stroke-i-1
    { strokeIdx: 3, t: 4 * strokeMs }   // last slot: scored at all (buggy loop dropped it)
  ]);
  expect(tl.loopLengthMs).toBe(5 * strokeMs); // full array incl. upbeat, not 4*strokeMs
});

test("matchHits with no hits and no expected", () => {
  const r = matchHits([], [], DEFAULT_TOLERANCE.off + 50);
  expect(r).toEqual({ matched: [], misses: [], extras: [] });
});

test("matchHits: single perfect on-time hit", () => {
  const e = [{ strokeIdx: 0, t: 100 }];
  const d = [{ t: 100, energy: 0.5 }];
  const r = matchHits(d, e, DEFAULT_TOLERANCE.off + 50);
  expect(r.matched).toHaveLength(1);
  expect(r.matched[0].delta).toBe(0);
  expect(r.matched[0].verdict).toBe("good");
  expect(r.misses).toEqual([]);
  expect(r.extras).toEqual([]);
});

test("matchHits: single off-but-attributable hit", () => {
  const e = [{ strokeIdx: 0, t: 100 }];
  const d = [{ t: 195, energy: 0.5 }]; // 95ms late → off
  const r = matchHits(d, e, DEFAULT_TOLERANCE.off + 50);
  expect(r.matched).toHaveLength(1);
  expect(r.matched[0].delta).toBe(95);
  expect(r.matched[0].verdict).toBe("off");
});

test("matchHits: missed expected, no detected", () => {
  const e = [{ strokeIdx: 0, t: 100 }];
  const r = matchHits([], e, DEFAULT_TOLERANCE.off + 50);
  expect(r.misses).toEqual(e);
});

test("matchHits: extra detection beyond window", () => {
  const e = [{ strokeIdx: 0, t: 100 }];
  const d = [{ t: 500, energy: 0.5 }];
  const r = matchHits(d, e, DEFAULT_TOLERANCE.off + 50);
  expect(r.matched).toEqual([]);
  expect(r.misses).toEqual(e);
  expect(r.extras).toEqual(d);
});

test("matchHits: two adjacent detections compete for one expected", () => {
  // expected at t=100, detections at 90 and 110 → 110 wins because |10|>|10|... actually both
  // are equidistant. We accept either, but in our greedy form the first one (t=90) wins.
  const e = [{ strokeIdx: 0, t: 100 }];
  const d = [{ t: 90, energy: 0.5 }, { t: 110, energy: 0.5 }];
  const r = matchHits(d, e, 200);
  expect(r.matched).toHaveLength(1);
  expect(r.matched[0].d.t).toBe(90);
  expect(r.extras).toHaveLength(1);
  expect(r.extras[0].t).toBe(110);
});

test("matchHits: detection prefers closer next-expected over current", () => {
  // detected at t=150, expected at t=100 (Δ=50) and t=200 (Δ=-50). Both within window.
  // We're walking forward, so we match d with the first expected (100, Δ=+50) and the
  // second expected becomes a miss.
  const e = [{ strokeIdx: 0, t: 100 }, { strokeIdx: 1, t: 200 }];
  const d = [{ t: 150, energy: 0.5 }];
  const r = matchHits(d, e, 200);
  expect(r.matched).toHaveLength(1);
  expect(r.matched[0].e.t).toBe(100);
  expect(r.misses).toHaveLength(1);
  expect(r.misses[0].t).toBe(200);
});

test("matchHits: perfect 4-beat run", () => {
  const e = Array.from({ length: 4 }, (_, i) => ({ strokeIdx: i, t: i * 125 }));
  const d = Array.from({ length: 4 }, (_, i) => ({ t: i * 125, energy: 0.5 }));
  const r = matchHits(d, e, 200);
  expect(r.matched).toHaveLength(4);
  expect(r.misses).toHaveLength(0);
  expect(r.extras).toHaveLength(0);
  expect(r.matched.every((m) => m.verdict === "good")).toBe(true);
});

test("matchHits: consistently 80ms late → all 'off'", () => {
  const e = Array.from({ length: 4 }, (_, i) => ({ strokeIdx: i, t: i * 125 }));
  const d = e.map((h) => ({ t: h.t + 80, energy: 0.5 }));
  const r = matchHits(d, e, 200);
  expect(r.matched).toHaveLength(4);
  expect(r.matched.every((m) => m.verdict === "off")).toBe(true);
  expect(r.matched.every((m) => m.delta === 80)).toBe(true);
});

test("matchHits: extra detection before all expected", () => {
  const e = [{ strokeIdx: 0, t: 500 }];
  const d = [{ t: 100, energy: 0.5 }];
  const r = matchHits(d, e, 200);
  expect(r.matched).toEqual([]);
  expect(r.misses).toEqual(e);
  expect(r.extras).toEqual(d);
});


test("scoreSession: empty session", () => {
  const s = scoreSession({ matched: [], misses: [], extras: [] });
  expect(s).toEqual({
    hits: 0, misses: 0, extras: 0, expectedTotal: 0,
    meanAbsDelta: 0, drift: 0, headlineScore: 100,
  });
});

test("scoreSession: perfect 4-beat run → 100", () => {
  const matched = [0, 1, 2, 3].map((i) => ({
    d: { t: i * 125, energy: 0.5 },
    e: { strokeIdx: i, t: i * 125 },
    delta: 0,
    verdict: "good" as const,
  }));
  const s = scoreSession({ matched, misses: [], extras: [] });
  expect(s.headlineScore).toBe(100);
  expect(s.meanAbsDelta).toBe(0);
  expect(s.drift).toBe(0);
  expect(s.hits).toBe(4);
});

test("scoreSession: half-missed run", () => {
  const matched = [0, 1].map((i) => ({
    d: { t: i * 125, energy: 0.5 },
    e: { strokeIdx: i, t: i * 125 },
    delta: 0,
    verdict: "good" as const,
  }));
  const misses = [{ strokeIdx: 2, t: 250 }, { strokeIdx: 3, t: 375 }];
  const s = scoreSession({ matched, misses, extras: [] });
  expect(s.hits).toBe(2);
  expect(s.misses).toBe(2);
  expect(s.expectedTotal).toBe(4);
  // 60 * 0.5 + 40 * 1.0 = 70
  expect(s.headlineScore).toBe(70);
});

test("scoreSession: all-late drift indicator", () => {
  const matched = [0, 1, 2, 3].map((i) => ({
    d: { t: i * 125 + 30, energy: 0.5 },
    e: { strokeIdx: i, t: i * 125 },
    delta: 30,
    verdict: "good" as const,
  }));
  const s = scoreSession({ matched, misses: [], extras: [] });
  // all deltas are +30 → drift = meanAbsDelta = 30
  expect(s.drift).toBe(30);
  expect(s.meanAbsDelta).toBe(30);
});

test("createScorer accumulates hits across a single loop", () => {
  const timeline = {
    expected: [
      { strokeIdx: 0, t: 0 },
      { strokeIdx: 1, t: 125 },
    ],
    loopLengthMs: 500,
    toleranceMs: DEFAULT_TOLERANCE,
  };
  const s = createScorer(timeline);
  s.acceptHit({ t: 0, energy: 0.5 });
  s.acceptHit({ t: 125, energy: 0.5 });
  s.finalize();
  const stats = s.stats();
  expect(stats.hits).toBe(2);
  expect(stats.misses).toBe(0);
});

test("createScorer: an early downbeat in the closing loop is credited to the next loop's stroke 0", () => {
  // The hit is filed in loop 0's bucket (engine has not wrapped yet) at t≈loopLen-70, i.e. 70 ms
  // before the NEXT downbeat. After the wrap it must score loop 1's stroke 0 — not a miss + extra.
  const tl = { expected: [{ strokeIdx: 0, t: 0 }, { strokeIdx: 1, t: 500 }], loopLengthMs: 1000, toleranceMs: DEFAULT_TOLERANCE };
  const s = createScorer(tl);
  s.acceptHit({ t: 930, energy: 1 }); // 70 ms-early downbeat for loop 1, parked in loop 0's bucket
  s.onLoopWrap();                      // audio wraps → loop 0 completes, loop 1 in-progress
  // Lights loop 1's stroke 0 with a negative (early) delta…
  expect(s.liveVerdicts({ currentLoopElapsedMs: 5 }).perStroke.get(0)).toMatchObject({ delta: -70 });
  s.finalize();
  // …and is a HIT with no phantom extra (loop 0's own strokes are misses — nothing was played there).
  expect(s.stats().hits).toBe(1);
  expect(s.stats().extras).toBe(0);
});

test("createScorer: a hit just PAST the boundary (no modulo) is credited to the next stroke 0", () => {
  const tl = { expected: [{ strokeIdx: 0, t: 0 }, { strokeIdx: 1, t: 500 }], loopLengthMs: 1000, toleranceMs: DEFAULT_TOLERANCE };
  const s = createScorer(tl);
  s.acceptHit({ t: 1003, energy: 1 }); // 3 ms after the nominal boundary, parked in loop 0's bucket
  s.onLoopWrap();
  expect(s.liveVerdicts({ currentLoopElapsedMs: 5 }).perStroke.get(0)).toMatchObject({ delta: 3 });
  s.finalize();
  expect(s.stats().hits).toBe(1);
  expect(s.stats().extras).toBe(0);
});

test("createScorer: nearest unfilled wins across the boundary (late last-stroke AND early downbeat)", () => {
  // Last stroke at t=875 (window 200). A 40 ms-late hit (915) is nearer it than the boundary (85 across)
  // → stays on stroke 7; a 10 ms-early downbeat (990) binds to the next loop's stroke 0. Both are hits.
  const tl = { expected: [{ strokeIdx: 0, t: 0 }, { strokeIdx: 7, t: 875 }], loopLengthMs: 1000, toleranceMs: DEFAULT_TOLERANCE };
  const s = createScorer(tl);
  s.acceptHit({ t: 915, energy: 1 }); // 40 ms late on the last stroke
  s.acceptHit({ t: 990, energy: 1 }); // 10 ms-early downbeat for the next loop
  s.onLoopWrap();
  s.finalize();
  expect(s.stats().hits).toBe(2);
  expect(s.stats().extras).toBe(0);
});

test("createScorer resets the matcher per loop", () => {
  const timeline = {
    expected: [{ strokeIdx: 0, t: 0 }],
    loopLengthMs: 500,
    toleranceMs: DEFAULT_TOLERANCE,
  };
  const s = createScorer(timeline);
  s.acceptHit({ t: 0, energy: 0.5 });   // matches loop 0 stroke 0
  s.onLoopWrap();
  s.acceptHit({ t: 0, energy: 0.5 });   // matches loop 1 stroke 0
  s.finalize();
  expect(s.stats().hits).toBe(2);
});

test("createScorer trims tail when finalize(tailMs) given", () => {
  const timeline = {
    expected: [
      { strokeIdx: 0, t: 0 },
      { strokeIdx: 1, t: 1000 }, // late hit in the tail
    ],
    loopLengthMs: 2000,
    toleranceMs: DEFAULT_TOLERANCE,
  };
  const s = createScorer(timeline);
  s.acceptHit({ t: 0, energy: 0.5 });
  // user pressed Stop at "now = 1100", tailMs = 500 → drop expected hits in [600..1100]
  s.finalize({ stopAtMs: 1100, tailMs: 500 });
  // The expected at t=1000 falls in the trim window and is dropped.
  expect(s.stats().misses).toBe(0);
  expect(s.stats().hits).toBe(1);
});

test("finalize: strokes after the stop point (never reached) are not counted as misses", () => {
  // Stop 50ms into a single loop. Only stroke t=0 has come around; strokes t=100/200/300
  // are still in the future and never played. The live path at elapsed=50 correctly shows
  // 0 misses — finalize must AGREE, not retroactively count the un-played future strokes.
  // This is the "stop → Misses jumps to a full loop" over-count.
  const s = createScorer(monoTimeline);
  s.acceptHit({ t: 0, energy: 1 }); // played the only reachable stroke, on time
  const live = s.stats({ currentLoopElapsedMs: 50 });
  expect(live.misses).toBe(0); // sanity: live path is correct
  s.finalize({ stopAtMs: 50, tailMs: 500 });
  expect(s.stats().misses).toBe(0); // future strokes must NOT become misses at finalize
});

test("finalize: completed loops count in full, the partial final loop only counts reached strokes", () => {
  // Unified rule: every COMPLETED loop is scored in full ("keep counting every loop"),
  // but the in-progress loop at stop only counts strokes the metronome actually reached.
  // monoTimeline: strokes 0/100/200/300, loopLen 400.
  const s = createScorer(monoTimeline);
  s.onLoopWrap();                          // loop 1: played nothing → completes → 4 misses, in full
  s.finalize({ stopAtMs: 150, tailMs: 0 }); // loop 2: stopped 150ms in → only strokes t=0,100 reached
  // 4 (full completed loop) + 2 (reached strokes 0,100 in the final loop) = 6.
  // Before the fix the final loop also counted strokes 200/300 → 8.
  expect(s.stats().misses).toBe(6);
});

test("createScorer stats() before finalize returns live approximation", () => {
  const timeline = {
    expected: [{ strokeIdx: 0, t: 0 }],
    loopLengthMs: 500,
    toleranceMs: DEFAULT_TOLERANCE,
  };
  const s = createScorer(timeline);
  s.acceptHit({ t: 0, energy: 0.5 });
  const live = s.stats();          // pre-finalize: live path
  expect(live.hits).toBe(1);
  expect(live.misses).toBe(0);
  s.finalize();
  expect(s.stats().hits).toBe(1);  // finalize agrees
});

test("liveVerdicts: signed delta visible through perStroke (late > 0, early < 0, on-time 0)", () => {
  // Isolated single-stroke timeline makes the matching deterministic.
  const timeline = {
    expected: [{ strokeIdx: 0, t: 0 }],
    loopLengthMs: 500,
    toleranceMs: DEFAULT_TOLERANCE,
  };
  const scorerOnTime = createScorer(timeline);
  scorerOnTime.acceptHit({ t: 0, energy: 0.5 }); // on time → delta 0
  expect(scorerOnTime.liveVerdicts().perStroke.get(0)).toMatchObject({ verdict: "good", delta: 0 });

  const scorerLate = createScorer(timeline);
  scorerLate.acceptHit({ t: 15, energy: 0.5 }); // 15ms late → delta +15
  expect(scorerLate.liveVerdicts().perStroke.get(0)).toMatchObject({ delta: 15 });

  const scorerEarly = createScorer(timeline);
  scorerEarly.acceptHit({ t: -15, energy: 0.5 }); // 15 ms early → raw negative tRel, matches stroke 0
  expect(scorerEarly.liveVerdicts().perStroke.get(0)).toMatchObject({ delta: -15 });
});

test("liveVerdicts: a slightly-early downbeat (raw negative tRel) lights stroke 0", () => {
  const timeline = { expected: [{ strokeIdx: 0, t: 0 }, { strokeIdx: 1, t: 500 }], loopLengthMs: 1000, toleranceMs: DEFAULT_TOLERANCE };
  const s = createScorer(timeline);
  s.acceptHit({ t: -20, energy: 1 });  // 20 ms before this loop's downbeat
  expect(s.liveVerdicts().perStroke.get(0)).toMatchObject({ verdict: "good", delta: -20 });
  s.acceptHit({ t: 510, energy: 1 });  // a normal in-loop hit on stroke 1
  expect(s.liveVerdicts().perStroke.get(1)).toMatchObject({ verdict: "good", delta: 10 });
});


test("deltaToPosition: centre, zone boundary, edges, clamp, direction", () => {
  // on-time → centre, good zone
  expect(deltaToPosition(0)).toEqual({ percent: 50, zone: "good" });
  // late (+) leans left (<50); early (-) leans right (>50)
  expect(deltaToPosition(60).percent).toBeCloseTo(30, 5);   // +good → 20% left of centre
  expect(deltaToPosition(-60).percent).toBeCloseTo(70, 5);
  // zone flips just past the good tolerance
  expect(deltaToPosition(60).zone).toBe("good");
  expect(deltaToPosition(61).zone).toBe("off");
  // off tolerance lands at the edges
  expect(deltaToPosition(150)).toEqual({ percent: 0, zone: "off" });   // late edge (left)
  expect(deltaToPosition(-150)).toEqual({ percent: 100, zone: "off" }); // early edge (right)
  // beyond off is clamped
  expect(deltaToPosition(400).percent).toBe(0);
  expect(deltaToPosition(-400).percent).toBe(100);
});

test("toleranceForDifficulty scales DEFAULT_TOLERANCE per level", () => {
  expect(toleranceForDifficulty("normal")).toEqual(DEFAULT_TOLERANCE);   // ×1.0 → identical to today
  expect(toleranceForDifficulty("easy")).toEqual({ good: 105, off: 263 }); // ×1.75, rounded
  expect(toleranceForDifficulty("hard")).toEqual({ good: 36, off: 90 });   // ×0.6
});

test("deltaToPosition: scales the marker position to the given tolerance", () => {
  const hard = toleranceForDifficulty("hard"); // good 36, off 90
  expect(deltaToPosition(90, hard).percent).toBe(0);   // a 90ms-late hit is at the late edge under hard
  expect(deltaToPosition(0, hard).percent).toBe(50);   // on-time = centre
  expect(deltaToPosition(90, hard).zone).toBe("off");  // 90 > good(36) → off
  // same 90ms hit under the default (off=150) lands mid-meter, NOT at the edge — the bug this fixes
  expect(deltaToPosition(90).percent).toBe(20);
  // easy (off=263 after rounding): a 263ms-late hit reaches the edge
  const easy = toleranceForDifficulty("easy"); // good 105, off 263
  expect(deltaToPosition(263, easy).percent).toBe(0);
});

// Live stats are monotonic: a stroke is only counted once its timing window has
// closed (t <= elapsed - windowMs). windowMs = 200 for DEFAULT_TOLERANCE.
const monoTimeline = {
  expected: [
    { strokeIdx: 0, t: 0 },
    { strokeIdx: 1, t: 100 },
    { strokeIdx: 2, t: 200 },
    { strokeIdx: 3, t: 300 },
  ],
  loopLengthMs: 400,
  toleranceMs: DEFAULT_TOLERANCE,
};

test("live stats: not-yet-reached strokes are not counted as misses", () => {
  const s = createScorer(monoTimeline);
  // elapsed 100 → cutoff = 100 - 200 = -100 → no stroke window closed yet.
  const st = s.stats({ currentLoopElapsedMs: 100 });
  expect(st.misses).toBe(0);
  expect(st.expectedTotal).toBe(0);
});

test("live stats: a stroke becomes a miss only after its window closes", () => {
  const s = createScorer(monoTimeline);
  // elapsed 250 → cutoff = 50 → only stroke t=0 is closed; nothing played → 1 miss.
  const st = s.stats({ currentLoopElapsedMs: 250 });
  expect(st.expectedTotal).toBe(1);
  expect(st.misses).toBe(1);
  expect(st.hits).toBe(0);
});

test("live stats: a played stroke counts as a hit once its window closes", () => {
  const s = createScorer(monoTimeline);
  s.acceptHit({ t: 0, energy: 1 }); // on stroke 0 → good
  const st = s.stats({ currentLoopElapsedMs: 250 }); // cutoff 50 → stroke 0 closed
  expect(st.hits).toBe(1);
  expect(st.misses).toBe(0);
  expect(st.expectedTotal).toBe(1);
});

test("live stats: misses are monotonic and do not jump at a loop wrap", () => {
  const s = createScorer(monoTimeline);
  const m1 = s.stats({ currentLoopElapsedMs: 250 }).misses; // cutoff 50  → stroke t=0 closed → 1
  const m2 = s.stats({ currentLoopElapsedMs: 399 }).misses; // cutoff 199 → strokes t=0,100 closed → 2 (loop tail not judged live yet)
  s.onLoopWrap();                                            // loop 1 completes → its full 4 strokes (no hits) lock as misses
  const m3 = s.stats({ currentLoopElapsedMs: 50 }).misses;  // new loop cutoff -150 → 0 closed; completed loop contributes 4
  expect(m1).toBeLessThanOrEqual(m2);
  expect(m2).toBeLessThanOrEqual(m3);
  expect(m3).toBe(4); // completed loop's 4 only; new loop adds nothing yet (was 8 before the fix)
});

test("live stats: an on-time hit is not transiently counted as an extra (no flicker)", () => {
  // windowMs = 200. Hit stroke 1 (t=1000) on time, then poll while elapsed ≈ 1000 — stroke 1's
  // window [800,1200] hasn't closed yet. The hit must read as a hit, never a fleeting extra.
  const timeline = {
    expected: [{ strokeIdx: 0, t: 0 }, { strokeIdx: 1, t: 1000 }],
    loopLengthMs: 2000,
    toleranceMs: DEFAULT_TOLERANCE,
  };
  const s = createScorer(timeline);
  s.acceptHit({ t: 1000, energy: 1 });
  const st = s.stats({ currentLoopElapsedMs: 1000 });
  expect(st.extras).toBe(0);
  expect(st.hits).toBe(1);
});

test("live stats: absent elapsed counts the whole current loop (regression guard)", () => {
  const s = createScorer(monoTimeline);
  s.acceptHit({ t: 0, energy: 1 }); // matches stroke 0
  const st = s.stats(); // no opts → legacy behaviour: match against the full timeline
  expect(st.hits).toBe(1);
  expect(st.misses).toBe(3); // strokes 1,2,3 unmatched
  expect(st.expectedTotal).toBe(4);
});

const twoStroke = {
  expected: [{ strokeIdx: 0, t: 0 }, { strokeIdx: 1, t: 250 }],
  loopLengthMs: 500,
  toleranceMs: DEFAULT_TOLERANCE,
};

test("liveVerdicts: a matched hit yields a good verdict with its delta", () => {
  const s = createScorer(twoStroke);
  s.acceptHit({ t: 10, energy: 0.5 }); // 10ms late on stroke 0
  const v = s.liveVerdicts({ currentLoopElapsedMs: 300 });
  expect(v.perStroke.get(0)).toEqual({ verdict: "good", delta: 10 });
});

test("liveVerdicts: an expected stroke past its closed window is a miss", () => {
  const s = createScorer(twoStroke);
  // No hit. windowMs = off+50 = 200. Stroke 0 (t=0) closes at elapsed 200; ask at 300.
  const v = s.liveVerdicts({ currentLoopElapsedMs: 300 });
  expect(v.perStroke.get(0)).toEqual({ verdict: "miss", delta: null });
});

test("liveVerdicts: a stroke whose window has not closed is neither matched nor a miss", () => {
  const s = createScorer(twoStroke);
  // elapsed 100 < stroke 0 window close (200) → stroke 0 absent (not yet a miss).
  const v = s.liveVerdicts({ currentLoopElapsedMs: 100 });
  expect(v.perStroke.has(0)).toBe(false);
});

test("liveVerdicts: a hit matching no stroke is an extra, not a verdict", () => {
  // Use wider-spaced strokes so t=500 is genuinely outside windowMs=200 from both.
  // Strokes at t=0 and t=1000, loopLen=2000, windowMs=200. Hit at t=500 is 500ms from each.
  // Ask at elapsed=100 (cutoff=-100) so no stroke windows have closed yet → no misses in perStroke.
  const wideStroke = {
    expected: [{ strokeIdx: 0, t: 0 }, { strokeIdx: 1, t: 1000 }],
    loopLengthMs: 2000,
    toleranceMs: DEFAULT_TOLERANCE,
  };
  const s = createScorer(wideStroke);
  s.acceptHit({ t: 500, energy: 0.5 }); // between strokes, > windowMs=200 from both → extra
  const v = s.liveVerdicts({ currentLoopElapsedMs: 100 });
  expect(v.perStroke.size).toBe(0);
  expect(v.extras).toHaveLength(1);
  expect(v.extras[0].t).toBe(500);
});

test("liveVerdicts: a closer later hit reassigns the earlier one to an extra", () => {
  const s = createScorer(twoStroke);
  s.acceptHit({ t: 40, energy: 0.5 });  // first, 40ms from stroke 0
  s.acceptHit({ t: 5, energy: 0.5 });   // closer to stroke 0 → wins; the 40ms hit becomes an extra
  const v = s.liveVerdicts({ currentLoopElapsedMs: 300 });
  expect(v.perStroke.get(0)?.delta).toBe(5);
  expect(v.extras.map((e) => e.t)).toContain(40);
});

test("liveVerdicts: recent trail carries the last matched deltas across loops", () => {
  const s = createScorer(twoStroke);
  s.acceptHit({ t: 0, energy: 0.5 });   // loop 0 stroke 0
  s.onLoopWrap();
  s.acceptHit({ t: 250, energy: 0.5 }); // loop 1 stroke 1
  const v = s.liveVerdicts({ currentLoopElapsedMs: 300 });
  expect(v.recent.map((r) => r.verdict)).toEqual(["good", "good"]);
});

test("liveVerdicts: with no elapsed (e.g. before gameOn) shows no misses", () => {
  const s = createScorer(twoStroke);
  // No hits and no elapsed → we can't know any window has closed, so nothing is flagged missed
  // yet (otherwise the highlight would flash every unplayed stroke as a miss before play starts).
  const v = s.liveVerdicts();
  expect(v.perStroke.size).toBe(0);
});

test("scoreSession: extras dock the score, clamped and never negative", () => {
  const matched = [0, 1, 2, 3].map((i) => ({
    d: { t: i * 125, energy: 0.5 }, e: { strokeIdx: i, t: i * 125 }, delta: 0, verdict: "good" as const,
  }));
  const clean = scoreSession({ matched, misses: [], extras: [] });
  const sloppy = scoreSession({ matched, misses: [], extras: [{ t: 60, energy: 0.5 }, { t: 190, energy: 0.5 }] });
  expect(clean.headlineScore).toBe(100);
  // 4 expected, 2 extras → penalty = round(20 * 2/4) = 10 → 100 - 10 = 90
  expect(sloppy.headlineScore).toBe(90);
  expect(sloppy.headlineScore).toBeGreaterThanOrEqual(0);
});

test("scoreSession: the extras penalty is capped so a spray can't dominate the score", () => {
  const matched = [0, 1].map((i) => ({
    d: { t: i * 125, energy: 0.5 }, e: { strokeIdx: i, t: i * 125 }, delta: 0, verdict: "good" as const,
  }));
  const clean = scoreSession({ matched, misses: [], extras: [] });
  const flooded = scoreSession({ matched, misses: [], extras: Array.from({ length: 50 }, (_, i) => ({ t: i, energy: 0.5 })) });
  // 2 expected, 50 extras → penalty capped at 20 → 100 - 20 = 80
  expect(flooded.headlineScore).toBe(80);
  expect(clean.headlineScore - flooded.headlineScore).toBeLessThanOrEqual(20);
  expect(flooded.headlineScore).toBeGreaterThanOrEqual(0);
});

test("scoreSession: extras penalty denominator uses hits+misses, not hits alone", () => {
  // 2 hits + 2 misses → expectedTotal 4; 2 extras → penalty round(20 * 2/4) = 10.
  const matched = [0, 1].map((i) => ({
    d: { t: i * 125, energy: 0.5 }, e: { strokeIdx: i, t: i * 125 }, delta: 0, verdict: "good" as const,
  }));
  const misses = [{ strokeIdx: 2, t: 250 }, { strokeIdx: 3, t: 375 }];
  const s = scoreSession({ matched, misses, extras: [{ t: 60, energy: 0.5 }, { t: 190, energy: 0.5 }] });
  expect(s.expectedTotal).toBe(4);
  // base = round(60 * 2/4 + 40 * 1) = 70; − penalty 10 = 60
  expect(s.headlineScore).toBe(60);
});

test("extraStrokeIdx: rounds a stray hit to its nearest cell, upbeat-adjusted", () => {
  // strokeMs 125, upbeat 0, 4 cells. A hit at 130ms is nearest cell 1.
  expect(extraStrokeIdx(130, 125, 0, 4)).toBe(1);
  expect(extraStrokeIdx(60, 125, 0, 4)).toBe(0);   // rounds down to 0
});

test("extraStrokeIdx: subtracts the upbeat to match the verdicts-Map key", () => {
  // upbeat 1, strokeMs 125. A hit at 250ms → raw cell 2 → key 2-1 = 1.
  expect(extraStrokeIdx(250, 125, 1, 5)).toBe(1);
  expect(extraStrokeIdx(10, 125, 1, 5)).toBe(-1); // early hit on the upbeat cell → key -1
});

test("extraStrokeIdx: returns null when the hit rounds outside the loop's cells", () => {
  expect(extraStrokeIdx(99999, 125, 0, 4)).toBeNull();
  expect(extraStrokeIdx(-50, 125, 0, 4)).toBeNull();
});
