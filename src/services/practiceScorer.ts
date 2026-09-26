import { Instrument } from "../config";
import { Pattern } from "../state/pattern";

export const SILENT_STROKES = new Set<string>([" ", "", ".", "s"]);

export interface ExpectedHit {
  strokeIdx: number;
  /** ms from start of current loop iteration */
  t: number;
}

export interface ExpectedTimeline {
  expected: ExpectedHit[];
  loopLengthMs: number;
  toleranceMs: { good: number; off: number };
}

export interface DetectedHit {
  /** ms from the loop baseline, after the latency offset — raw and signed: negative for a hit a
   *  hair before the downbeat (early), or > loopLen for one just past the boundary before the wrap. */
  t: number;
  energy: number;
}

export type Verdict = "good" | "off" | "miss" | "extra";

export interface MatchResult {
  matched: Array<{ d: DetectedHit; e: ExpectedHit; delta: number; verdict: "good" | "off" }>;
  misses: ExpectedHit[];
  extras: DetectedHit[];
}

export interface LiveVerdicts {
  /** current in-progress loop, per stroke: good/off (with delta) or miss (delta null) */
  perStroke: Map<number, { verdict: "good" | "off" | "miss"; delta: number | null }>;
  /** current-loop detected hits that matched no stroke (for the extra markers — Task 2.4) */
  extras: DetectedHit[];
  /** rolling last-N matched hits across the session, for the timing-meter trail */
  recent: Array<{ delta: number; verdict: "good" | "off" }>;
}

export interface SessionStats {
  hits: number;
  misses: number;
  extras: number;
  expectedTotal: number;
  meanAbsDelta: number;
  drift: number;
  headlineScore: number;
}

export const DEFAULT_TOLERANCE = { good: 60, off: 150 } as const;

export type Difficulty = "easy" | "normal" | "hard";

// Lower difficulty widens the windows; "normal" is ×1 so it equals DEFAULT_TOLERANCE.
const DIFFICULTY_FACTOR: Record<Difficulty, number> = { easy: 1.75, normal: 1, hard: 0.6 };

export function toleranceForDifficulty(difficulty: Difficulty): { good: number; off: number } {
  const f = DIFFICULTY_FACTOR[difficulty];
  return {
    good: Math.round(DEFAULT_TOLERANCE.good * f),
    off: Math.round(DEFAULT_TOLERANCE.off * f),
  };
}

/**
 * Maps a signed timing delta (ms; + = late, − = early) to a marker position on the
 * timing meter. `percent` is 0 (left/late edge) … 50 (centre/on-time) … 100 (right/
 * early edge), clamped. `zone` is "good" within the good tolerance, else "off".
 */
export function deltaToPosition(
  delta: number,
  tolerance: { good: number; off: number } = DEFAULT_TOLERANCE,
): { percent: number; zone: "good" | "off" } {
  const percent = Math.max(0, Math.min(100, 50 - (delta / tolerance.off) * 50));
  const zone: "good" | "off" = Math.abs(delta) <= tolerance.good ? "good" : "off";
  return { percent, zone };
}

/**
 * Maps a stray hit's loop time to the partition cell it lands nearest, as the upbeat-adjusted
 * strokeIdx key the verdicts Map uses — or null if it rounds outside the loop's cells. Lets the
 * partition tint "where the stray note landed."
 */
export function extraStrokeIdx(
  extraTimeMs: number,
  strokeMs: number,
  upbeat: number,
  slotCount: number,
): number | null {
  // Guard the time, not rawIdx: Math.round(-0.4) is 0, so a pre-loop hit would otherwise land on
  // cell 0. After this, rawIdx is always >= 0.
  if (extraTimeMs < 0) return null;
  const rawIdx = Math.round(extraTimeMs / strokeMs);
  if (rawIdx >= slotCount) return null; // rounds onto/after the loop boundary — no cell there
  return rawIdx - upbeat;
}

export function buildExpectedTimeline(
  pattern: Pattern,
  instrument: Instrument,
  speedBpm: number,
  tolerance: { good: number; off: number } = DEFAULT_TOLERANCE,
): ExpectedTimeline {
  const strokeMs = 60_000 / (speedBpm * pattern.time);
  // pattern[instrument] is [pickup(upbeat slots) … main(length*time slots)]; iterate the
  // FULL array so the last `upbeat` main strokes are scored, and so the played loop length
  // (which includes the pickup) matches.
  const slotCount = pattern.length * pattern.time + pattern.upbeat;
  const line = pattern[instrument] ?? [];
  const expected: ExpectedHit[] = [];
  for (let i = 0; i < slotCount; i++) {
    const stroke = line[i];
    if (!SILENT_STROKES.has(stroke ?? "")) {
      // strokeIdx matches PatternPlayer's cell label `stroke-i-${i - upbeat}`; t stays
      // raw-indexed because loopBaselinePerf is anchored at raw index 0, not the downbeat.
      expected.push({ strokeIdx: i - pattern.upbeat, t: i * strokeMs });
    }
  }
  return {
    expected,
    loopLengthMs: slotCount * strokeMs,
    toleranceMs: { ...tolerance },
  };
}

function classifyDelta(delta: number, tolerance: { good: number; off: number }): "good" | "off" {
  return Math.abs(delta) <= tolerance.good ? "good" : "off";
}

export function matchHits(
  detected: DetectedHit[],
  expected: ExpectedHit[],
  windowMs: number,
  tolerance: { good: number; off: number } = DEFAULT_TOLERANCE,
): MatchResult {
  // Walking-pointer greedy nearest-neighbour. Both arrays MUST be time-sorted by the caller.
  const matched: MatchResult["matched"] = [];
  const misses: ExpectedHit[] = [];
  const extras: DetectedHit[] = [];

  let ei = 0; // expected pointer
  let di = 0; // detected pointer

  while (ei < expected.length && di < detected.length) {
    const e = expected[ei];
    const d = detected[di];
    const delta = d.t - e.t;

    if (delta < -windowMs) {
      extras.push(d); // detected too far before expected
      di++;
    } else if (delta > windowMs) {
      misses.push(e); // expected too far before detected
      ei++;
    } else {
      const dNext = detected[di + 1];
      if (dNext && Math.abs(dNext.t - e.t) < Math.abs(delta) && Math.abs(dNext.t - e.t) <= windowMs) {
        extras.push(d); // a strictly closer detected follows → this one is an extra
        di++;
      } else {
        matched.push({ d, e, delta, verdict: classifyDelta(delta, tolerance) });
        ei++;
        di++;
      }
    }
  }

  while (ei < expected.length) misses.push(expected[ei++]);
  while (di < detected.length) extras.push(detected[di++]);

  return { matched, misses, extras };
}

// Max points the extras penalty can dock (out of 100). The penalty ramps linearly to this at
// extras == expectedTotal, then caps — so a spray of false positives can't bury an otherwise-good
// score. Penalising extras is fair because the sensitivity slider lets a player cool a too-hot
// detector (its false positives are what surface as extras).
const EXTRAS_PENALTY_MAX = 20;

export function scoreSession(
  match: MatchResult,
  tolerance: { good: number; off: number } = DEFAULT_TOLERANCE,
): SessionStats {
  const hits = match.matched.length;
  const misses = match.misses.length;
  const extras = match.extras.length;
  const expectedTotal = hits + misses;

  const meanAbsDelta = hits === 0
    ? 0
    : match.matched.reduce((s, m) => s + Math.abs(m.delta), 0) / hits;
  const drift = hits === 0
    ? 0
    : match.matched.reduce((s, m) => s + m.delta, 0) / hits;

  const hitRatio = expectedTotal === 0 ? 1 : hits / expectedTotal;
  const timingTightness = Math.max(0, Math.min(1, 1 - meanAbsDelta / tolerance.off));
  // Spurious notes are a real fault for a timing trainer — dock a penalty proportional to extras
  // as a fraction of the expected strokes (capped at EXTRAS_PENALTY_MAX). Gated on expectedTotal>0
  // so an empty pattern can't divide by zero; the final score is clamped non-negative.
  const extrasPenalty = expectedTotal === 0
    ? 0
    : Math.min(EXTRAS_PENALTY_MAX, Math.round(EXTRAS_PENALTY_MAX * (extras / expectedTotal)));
  const headlineScore = Math.max(0, Math.round(60 * hitRatio + 40 * timingTightness) - extrasPenalty);

  return {
    hits, misses, extras, expectedTotal,
    meanAbsDelta, drift, headlineScore,
  };
}

export interface ScorerHandle {
  acceptHit(hit: DetectedHit): void;
  onLoopWrap(): void;
  finalize(opts?: { stopAtMs: number; tailMs: number }): void;
  stats(opts?: { currentLoopElapsedMs?: number | null }): SessionStats;
  liveVerdicts(opts?: { currentLoopElapsedMs?: number | null }): LiveVerdicts;
}

interface UnrolledExpected extends ExpectedHit { loopIdx: number; }
interface UnrolledDetected extends DetectedHit { loopIdx: number; }

export function createScorer(timeline: ExpectedTimeline): ScorerHandle {
  let currentLoopDetected: DetectedHit[] = [];
  const completedLoops: DetectedHit[][] = [];
  let finalized = false;
  let finalMatch: MatchResult = { matched: [], misses: [], extras: [] };
  const windowMs = timeline.toleranceMs.off + 50;
  const loopLen = timeline.loopLengthMs;

  // Match EVERY loop on one monotonic timeline (loop k at [k·loopLen, (k+1)·loopLen)). This lets a
  // near-boundary hit bind to the NEXT loop's stroke 0 — a per-loop matcher could never reach it,
  // because the hit and the stroke it should satisfy sit in different loops. loopIdx is carried on
  // each unrolled hit (not recomputed by division) so float error can't misattribute a boundary.
  function rawUnrolledMatch() {
    const L = completedLoops.length; // index of the in-progress loop
    const detected: UnrolledDetected[] = [];
    completedLoops.forEach((bucket, k) => {
      for (const d of bucket) detected.push({ ...d, t: d.t + k * loopLen, loopIdx: k });
    });
    for (const d of currentLoopDetected) detected.push({ ...d, t: d.t + L * loopLen, loopIdx: L });
    detected.sort((a, b) => a.t - b.t);

    const expected: UnrolledExpected[] = [];
    for (let k = 0; k <= L; k++) {
      for (const e of timeline.expected) expected.push({ strokeIdx: e.strokeIdx, t: e.t + k * loopLen, loopIdx: k });
    }
    // matchHits returns the same object references it was given, so loopIdx survives the round-trip.
    return matchHits(detected, expected, windowMs, timeline.toleranceMs) as unknown as {
      matched: Array<{ d: UnrolledDetected; e: UnrolledExpected; delta: number; verdict: "good" | "off" }>;
      misses: UnrolledExpected[];
      extras: UnrolledDetected[];
    };
  }

  // Turn the unrolled match into the scored MatchResult. COMPLETED loops are scored in full; the
  // IN-PROGRESS loop (loopIdx === L) only books a MISS once the stroke's window has closed by
  // currentMissCutoffMs. Pass Infinity to judge the whole in-progress loop. scoreSession reads only
  // counts + delta, so the unrolled times in the returned result are immaterial to the score.
  function buildSessionMatch(currentMissCutoffMs: number): MatchResult {
    const L = completedLoops.length;
    const r = rawUnrolledMatch();
    const misses = r.misses.filter((e) => e.loopIdx < L || (e.t - L * loopLen) <= currentMissCutoffMs);
    return { matched: r.matched, misses, extras: r.extras };
  }

  const RECENT_TRAIL = 5;

  function liveVerdicts(opts?: { currentLoopElapsedMs?: number | null }): LiveVerdicts {
    const L = completedLoops.length;
    // A miss only lights once its window has PROVABLY closed; with no elapsed yet (before gameOn
    // anchors the baseline) we cannot know what has closed, so show NO misses (−Infinity).
    const cutoff = finalized
      ? Infinity
      : (opts?.currentLoopElapsedMs == null ? -Infinity : opts.currentLoopElapsedMs - windowMs);
    const full = rawUnrolledMatch();
    const perStroke = new Map<number, { verdict: "good" | "off" | "miss"; delta: number | null }>();
    // In-progress loop only — the partition shows the loop being played. A hit from the just-closed
    // loop that binds forward to this loop's stroke 0 (the early downbeat) lights it here.
    for (const m of full.matched) {
      if (m.e.loopIdx === L) perStroke.set(m.e.strokeIdx, { verdict: m.verdict, delta: m.delta });
    }
    for (const e of full.misses) {
      if (e.loopIdx === L && (e.t - L * loopLen) <= cutoff && !perStroke.has(e.strokeIdx)) {
        perStroke.set(e.strokeIdx, { verdict: "miss", delta: null });
      }
    }
    // Extras of the in-progress loop, mapped back to in-loop time so extraStrokeIdx tints the right cell.
    const extras = full.extras
      .filter((d) => d.loopIdx === L)
      .map((d) => ({ t: d.t - L * loopLen, energy: d.energy }));
    // Rolling meter trail: last N matched across all loops, ordered by loop then stroke.
    const recent = full.matched.slice(-RECENT_TRAIL).map((m) => ({ delta: m.delta, verdict: m.verdict }));
    return { perStroke, extras, recent };
  }

  return {
    acceptHit(hit) {
      if (finalized) return;
      currentLoopDetected.push(hit);
    },
    onLoopWrap() {
      if (finalized) return;
      completedLoops.push(currentLoopDetected);
      currentLoopDetected = [];
    },
    finalize(opts) {
      if (finalized) return;
      finalized = true;
      // Stop grace: a stroke within tailMs before the stop isn't judged (the user stopped
      // mid-flow), and strokes after the stop never played — both fall outside the cutoff at
      // stopAtMs - tailMs. No opts → judge the whole in-progress loop.
      finalMatch = buildSessionMatch(opts ? opts.stopAtMs - opts.tailMs : Infinity);
    },
    stats(opts) {
      if (finalized) return scoreSession(finalMatch, timeline.toleranceMs);
      // Live: a stroke is a miss only once its full timing window has closed (elapsed - windowMs).
      // Absent elapsed (e.g. not in gameOn) → judge the whole loop (legacy guard).
      const elapsed = opts?.currentLoopElapsedMs ?? null;
      const cutoff = elapsed === null ? Infinity : elapsed - windowMs;
      return scoreSession(buildSessionMatch(cutoff), timeline.toleranceMs);
    },
    liveVerdicts,
  };
}
