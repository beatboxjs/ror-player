import { Ref, ref } from "vue";
import mitt, { Emitter } from "mitt";
import { MicPermission } from "./mediaPermissions";
import { OnsetDetector } from "./onsetDetector";
import { createScorer, ScorerHandle, buildExpectedTimeline, SessionStats, LiveVerdicts, toleranceForDifficulty, Difficulty } from "./practiceScorer";
import config, { Instrument } from "../config";
import { Pattern, normalizePattern } from "../state/pattern";
import type Beatbox from "beatbox.js";
import { patternToBeatbox, createBeatbox, getPlayerById, BeatboxReference } from "./player";
import { normalizePlaybackSettings } from "../state/playbackSettings";

export type PracticeState =
  | "idle"
  | "requestingMic"
  | "countIn"
  | "gameOn"
  | "finalising"
  | "results";

export type PracticeMode = "instrument" | "band";

export interface PracticeConfig {
  pattern: Pattern;
  instrument: Instrument;
  speedBpm: number;
  mode: PracticeMode;
  difficulty?: Difficulty;
  sensitivity?: number;
}

export interface PracticeEngineDeps {
  micPermission: MicPermission;
  detector: OnsetDetector;
}

export interface PracticeEngineOpts {
  timer?: { setTimeout: typeof setTimeout; clearTimeout: typeof clearTimeout };
  finaliseDelayMs?: number;
  beatboxFactory?: (repeat: boolean) => { ref: BeatboxReference; player: Beatbox };
  /** Latency offset in ms. A function is re-read on every onset, so a slider/calibration change
   *  takes effect live (parity with detector.setSensitivity). A bare number is captured once. */
  latencyOffsetMs?: number | (() => number);
  /** Injectable monotonic clock (ms). Defaults to performance.now(). Lets tests drive
   *  loop-elapsed deterministically — notably the time-based loop-wrap detection. */
  now?: () => number;
}

export type PracticeEngineEvents = {
  /** Fired whenever the live verdict state may have changed: on each onset, and at each loop wrap. */
  verdictsChanged: object;
  /** The audio loop wrapped (boundary crossed). NB: `verdictsChanged` also co-fires at every wrap. */
  loopWrap: object;
} & Record<string, unknown>;

export interface PracticeEngine {
  state: Ref<PracticeState>;
  start(): Promise<void>;
  stop(): Promise<void>;
  stopGame(): Promise<void>;
  /** @internal Test-only seam — no production callers (the UI reaches gameOn via the count-in "stop" path). */
  advanceToGameOn(baselineOverride?: number): Promise<void>;
  configure(c: PracticeConfig): void;
  stats(): SessionStats;
  verdicts(): LiveVerdicts;
  /** @internal Test-only — exposes the loop baseline for deterministic timing assertions. */
  debugLoopBaseline(): number | null;
  on<K extends keyof PracticeEngineEvents>(ev: K, h: (e: PracticeEngineEvents[K]) => void): void;
  off<K extends keyof PracticeEngineEvents>(ev: K, h: (e: PracticeEngineEvents[K]) => void): void;
}

function buildCountInPattern(speedBpm: number) {
  return normalizePattern({
    length: 8,         // 8 beats total (2 bars at 4/4)
    time: 1,           // 1 stroke per beat (just on-beat events)
    speed: speedBpm,
    ot: [
      "w", "w", "w", "w",   // bar 1 — metronome clicks on each beat
      "Õ", " ", " ", " ",   // bar 2 — whistle-in on beat 1
    ],
  });
}

export function createPracticeEngine(deps: PracticeEngineDeps, opts: PracticeEngineOpts = {}): PracticeEngine {
  const state = ref<PracticeState>("idle");
  const finaliseDelayMs = opts.finaliseDelayMs ?? 500;
  // Thunked to keep the window-method `this` binding — Firefox throws
  // "called on an object that does not implement interface Window" if these
  // globals are invoked as methods of a plain object.
  const timer = opts.timer ?? {
    setTimeout: (cb: () => void, ms: number) => window.setTimeout(cb, ms),
    clearTimeout: (id: number) => window.clearTimeout(id),
  };
  const now = opts.now ?? (() => performance.now());
  const resolveLatency = () =>
    typeof opts.latencyOffsetMs === "function" ? opts.latencyOffsetMs() : (opts.latencyOffsetMs ?? 0);
  const events: Emitter<PracticeEngineEvents> = mitt();
  let activeStream: MediaStream | null = null;

  let cfg: PracticeConfig | null = null;
  let scorer: ScorerHandle | null = null;
  let loopBaselinePerf: number | null = null;
  let loopLengthMs = 0; // current session's loop length (ms); set when the scorer/timeline is built
  let onsetHandler: ((e: { t_perf: number; energy: number }) => void) | null = null;
  let detachMainListeners: (() => void) | null = null; // removes the main player's play/beat handlers on teardown

  let countIn: { ref: BeatboxReference; player: Beatbox } | null = null;
  let main: { ref: BeatboxReference; player: Beatbox } | null = null;

  function makeBeatboxPair(repeat: boolean): { ref: BeatboxReference; player: Beatbox } {
    if (opts.beatboxFactory) return opts.beatboxFactory(repeat);
    const ref = createBeatbox(repeat);
    return { ref, player: getPlayerById(ref.id) };
  }

  function configure(c: PracticeConfig) {
    const oldCfg = cfg;
    cfg = c;
    if (oldCfg && state.value !== "idle") {
      const changed =
        oldCfg.pattern !== c.pattern ||
        oldCfg.instrument !== c.instrument ||
        oldCfg.speedBpm !== c.speedBpm ||
        oldCfg.mode !== c.mode ||
        oldCfg.difficulty !== c.difficulty;
      if (changed) void stop();
    }
  }

  function setupScorerAndDetector() {
    if (!cfg) throw new Error("Practice not configured");
    const timeline = buildExpectedTimeline(
      cfg.pattern, cfg.instrument, cfg.speedBpm,
      toleranceForDifficulty(cfg.difficulty ?? "normal"),
    );
    scorer = createScorer(timeline);
    loopLengthMs = timeline.loopLengthMs;

    onsetHandler = (e: { t_perf: number; energy: number }) => {
      if (state.value !== "gameOn" || loopBaselinePerf === null || !scorer) return;
      // Raw monotonic loop-relative time — NO modulo. Folding into [0, loopLen) would pin a hit played
      // just before the next downbeat to the CLOSING loop; the scorer's unrolled matcher needs the
      // true offset to credit it to the next loop's stroke 0 (the early-downbeat case). A hit slightly
      // before the baseline is correctly negative (early); one just past the boundary stays > loopLen.
      const tRel = (e.t_perf - resolveLatency()) - loopBaselinePerf;
      scorer.acceptHit({ t: tRel, energy: e.energy });
      events.emit("verdictsChanged", {});
    };
    deps.detector.on("onset", onsetHandler);
  }

  function teardown() {
    if (onsetHandler) {
      deps.detector.off("onset", onsetHandler);
      onsetHandler = null;
    }
    if (detachMainListeners) { detachMainListeners(); detachMainListeners = null; }
    if (countIn) { void countIn.player.stop(); countIn = null; }
    if (main)    { void main.player.stop();    main    = null; }
    scorer = null;
    loopBaselinePerf = null;
  }

  async function onCountInComplete() {
    if (state.value !== "countIn" || !cfg) return;
    const ps = normalizePlaybackSettings({
      speed: cfg.speedBpm,
      loop: true,
      headphones: cfg.mode === "instrument" ? [cfg.instrument] : [],
      mute: cfg.mode === "band" ? { [cfg.instrument]: true } : {},
    });
    const mainRaw = patternToBeatbox(cfg.pattern, ps);

    const mainPair = makeBeatboxPair(true);
    main = mainPair;
    const mainPlayer = mainPair.player;
    mainPlayer.setPattern(mainRaw);
    mainPlayer.setBeatLength(60_000 / cfg.speedBpm / config.playTime);
    mainPlayer.setRepeat(true);
    // Re-anchor the loop baseline on the REAL audio loop wrap — the beat whose position drops
    // (the audio clock wrapped to the top of the loop). Anchoring to elapsed time instead let the
    // per-loop overshoot accumulate, dragging the baseline progressively late so every hit read
    // earlier and earlier. The position signal IS the authoritative loop clock; its one hazard is
    // the AudioContext warm-up, where the first beats can report a garbage position (live trace:
    // 7373) that snaps to 0 ~15ms in and looks like a wrap — so only accept a wrap once at least
    // half a loop has actually elapsed, which rejects that startup transient.
    let lastBeatPosition = -1;
    const onPlay = () => {
      loopBaselinePerf = now();
      lastBeatPosition = -1;
    };
    const onBeat = (position: number) => {
      if (
        loopBaselinePerf !== null &&
        lastBeatPosition >= 0 &&
        position < lastBeatPosition &&
        now() - loopBaselinePerf >= loopLengthMs * 0.5
      ) {
        loopBaselinePerf = now();
        scorer?.onLoopWrap();
        events.emit("loopWrap", {});
        events.emit("verdictsChanged", {});
      }
      lastBeatPosition = position;
    };
    mainPlayer.on("play", onPlay);
    mainPlayer.on("beat", onBeat);
    // teardown() removes these so a late beat from this player's closing AudioContext can't reach
    // a *later* session's scorer (both handlers close over the module-level scorer/baseline).
    detachMainListeners = () => {
      mainPlayer.off("play", onPlay);
      mainPlayer.off("beat", onBeat);
    };
    mainPlayer.play();

    state.value = "gameOn";
  }

  async function start() {
    if (state.value !== "idle" && state.value !== "results") return;
    if (!cfg) throw new Error("configure() must be called first");
    teardown();  // Defensive: clean up any leftover from prior session before re-setup
    state.value = "requestingMic";
    try {
      activeStream = await deps.micPermission.request();
      // stop() may have been called while we were awaiting the permission prompt
      if ((state.value as PracticeState) === "idle") {
        deps.micPermission.release(activeStream);
        activeStream = null;
        return;
      }
      await deps.detector.start(activeStream, { userSensitivity: cfg?.sensitivity });
      // stop() may have been called while we were awaiting the detector
      if ((state.value as PracticeState) === "idle") return;
      setupScorerAndDetector();

      // Build the count-in pattern + Beatbox
      const countInPattern = buildCountInPattern(cfg.speedBpm);
      const countInRaw = patternToBeatbox(
        countInPattern,
        normalizePlaybackSettings({ headphones: ["ot"], whistle: false })
      );
      const countInPair = makeBeatboxPair(false);
      countIn = countInPair;
      const countInPlayer = countInPair.player;
      countInPlayer.setPattern(countInRaw);
      countInPlayer.setBeatLength(60_000 / cfg.speedBpm / config.playTime);
      countInPlayer.on("stop", () => {
        void onCountInComplete();
      });
      countInPlayer.play();

      state.value = "countIn";
    } catch (err) {
      state.value = "idle";
      teardown();
      if (activeStream) {
        deps.micPermission.release(activeStream);
        activeStream = null;
      }
      throw err;
    }
  }

  async function advanceToGameOn(baselineOverride?: number) {
    if (state.value !== "countIn") return;
    loopBaselinePerf = baselineOverride ?? now();
    state.value = "gameOn";
  }

  async function stopGame() {
    if (state.value !== "gameOn" && state.value !== "countIn") return;
    const stopAtMs = loopBaselinePerf === null ? 0 : now() - loopBaselinePerf;
    state.value = "finalising";

    // Stop Beatboxes immediately so user doesn't hear audio during the finalising delay
    if (countIn) { void countIn.player.stop(); countIn = null; }
    if (main)    { void main.player.stop();    main    = null; }

    await new Promise<void>((resolve) => timer.setTimeout(resolve, finaliseDelayMs));
    // stop() may have fired during the finalising delay
    if ((state.value as PracticeState) === "idle") return;
    scorer?.finalize({ stopAtMs, tailMs: 500 });
    state.value = "results";
    if (activeStream) {
      deps.micPermission.release(activeStream);
      activeStream = null;
    }
    await deps.detector.stop();
  }

  async function stop() {
    state.value = "idle";
    teardown();
    if (activeStream) {
      deps.micPermission.release(activeStream);
      activeStream = null;
    }
    await deps.detector.stop();
  }

  function stats(): SessionStats {
    // No baseline yet (count-in, or the brief gap before the main loop's "play" fires)
    // means the scored loop hasn't started — 0 ms have elapsed, so no stroke window has
    // closed and nothing can be missed. Passing null here instead would trip the scorer's
    // "absent elapsed → count the whole loop" path and flash a full loop of phantom misses.
    const currentLoopElapsedMs = loopBaselinePerf === null ? 0 : now() - loopBaselinePerf;
    return scorer?.stats({ currentLoopElapsedMs })
      ?? { hits: 0, misses: 0, extras: 0, expectedTotal: 0, meanAbsDelta: 0, drift: 0, headlineScore: 100 };
  }

  function verdicts(): LiveVerdicts {
    // Unlike stats() above, pass null when not in a baseline-anchored gameOn loop: liveVerdicts maps
    // absent-elapsed to a −Infinity cutoff (show NO misses), the right default for the highlight. Do
    // NOT "align" this to stats()'s 0-guard — the two have opposite safe defaults (stats() passes 0
    // because its scorer path treats null as "judge the whole loop").
    const currentLoopElapsedMs = (state.value === "gameOn" && loopBaselinePerf !== null)
      ? now() - loopBaselinePerf : null;
    return scorer?.liveVerdicts({ currentLoopElapsedMs })
      ?? { perStroke: new Map(), extras: [], recent: [] };
  }

  function debugLoopBaseline(): number | null { return loopBaselinePerf; }

  return {
    state, start, stop, stopGame, advanceToGameOn, configure, stats, verdicts, debugLoopBaseline,
    on: events.on.bind(events),
    off: events.off.bind(events),
  };
}
