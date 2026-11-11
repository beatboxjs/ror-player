export interface DetectorParams {
  multiplier: number;      // how many × noise-floor to trigger
  refractoryFrames: number; // minimum gap between triggers, in blocks
  noiseFloorInit?: number;
}

export interface DetectorState {
  params: DetectorParams;
  noiseFloor: number;
  lastFireFrame: number;
  lastHitEnergy: number;
  armed: boolean;
}

export interface OnsetEvent {
  /** Frame index of the trigger */
  frame: number;
  /** RMS energy of the triggering block */
  energy: number;
}

// Minimum value the adaptive noise floor can decay to. Without this clamp the
// floor adapts down to ambient room RMS (~0.001) and the trigger threshold
// drops with it, firing on breathing/fan noise. Empirically chosen so the
// threshold (floor × multiplier) lands cleanly between observed ambient peaks
// (≤0.034) and the softest real percussion hits (≥0.05).
export const MIN_NOISE_FLOOR = 0.015;

// Ceiling (× noise floor) below which the floor is allowed to LEARN. Kept well
// under the trigger (floor × multiplier) so a hit's loud body or decay tail can
// never drag the floor — and thus the threshold — upward; that positive feedback
// is what silenced detection after a few loops. processBlock caps the learn window at the live
// (effective) multiplier — base ÷ userSensitivity, which drops toward 1 at max sensitivity — so
// the floor can never learn up to the trigger even when sensitivity pulls that multiplier < 1.5.
export const LEARN_RATIO = 1.5;

// Post-hit decay gate. A resonant drum (Surdo) or a flam/tail (Repi, snare)
// emits weak secondary onsets 50–200 ms after the attack that belong to the SAME
// notated stroke. Right after a hit of energy E, a new onset must clear
// E × DECAY_GATE_RATIO; that bar relaxes linearly to 0 over DECAY_GATE_FRAMES.
// Energy-relative (not a blanket time window) so a genuine next stroke of similar
// force still fires even when played close behind — only much weaker echoes drop.
// Frames assume ~48 kHz / 128-sample blocks (≈300 ms); tuned against captured logs.
export const DECAY_GATE_RATIO = 0.5;
export const DECAY_GATE_FRAMES = 112;

/** Trigger multiplier after the user's sensitivity trim: threshold = noiseFloor × this. Higher
 *  sensitivity → lower multiplier → hotter (catches softer hits, admits more false positives). */
export function effectiveMultiplier(baseMultiplier: number, userSensitivity: number): number {
  return baseMultiplier / userSensitivity;
}

/** Single source of the three detector params. A caller may omit any of them
 *  (e.g. `detector.start(stream, {})`); the host resolves the fallback here and
 *  forwards explicit values to the worklet, so the worklet's own `??` defaults
 *  never run in production. Both sides import this instead of hardcoding copies. */
export const DEFAULT_DETECTOR_PARAMS = {
  multiplier: 3,
  refractoryFrames: 19,
  userSensitivity: 1,
} as const;

export function rmsOfBlock(block: Float32Array): number {
  if (block.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < block.length; i++) sumSq += block[i] * block[i];
  return Math.sqrt(sumSq / block.length);
}

export function createDetectorState(params: DetectorParams): DetectorState {
  return {
    params,
    noiseFloor: Math.max(MIN_NOISE_FLOOR, params.noiseFloorInit ?? 0.001),
    lastFireFrame: -Infinity,
    lastHitEnergy: 0,
    armed: true,
  };
}

/**
 * Processes one audio block. Mutates `state` in place (noiseFloor, lastFireFrame).
 * `state` must not be shared across concurrent callers.
 */
export function processBlock(
  state: DetectorState,
  block: Float32Array,
  currentFrame: number,
): OnsetEvent | null {
  const rms = rmsOfBlock(block);
  const exceeds = rms > state.noiseFloor * state.params.multiplier;

  // Learn the floor only from genuinely-quiet blocks (see LEARN_RATIO).
  if (rms < state.noiseFloor * Math.min(LEARN_RATIO, state.params.multiplier)) {
    state.noiseFloor = Math.max(
      MIN_NOISE_FLOOR,
      state.noiseFloor * 0.995 + rms * 0.005,
    );
  }

  // Re-arm once energy leaves the fireable zone. One strike's sustained decay
  // stays above the trigger and so fires only once, but a genuine next stroke —
  // which only has to dip below the trigger, not all the way to ambient — re-arms.
  if (!exceeds) {
    state.armed = true;
  }

  const pastRefractory = (currentFrame - state.lastFireFrame) > state.params.refractoryFrames;

  // Decay gate: weak onsets in the wake of a recent strong hit are that hit's
  // resonance/flam/tail, not a new stroke (see DECAY_GATE_RATIO).
  const sinceFire = currentFrame - state.lastFireFrame;
  const decayGate =
    sinceFire < DECAY_GATE_FRAMES
      ? state.lastHitEnergy * DECAY_GATE_RATIO * (1 - sinceFire / DECAY_GATE_FRAMES)
      : 0;

  if (exceeds && pastRefractory && state.armed && rms > decayGate) {
    state.lastFireFrame = currentFrame;
    state.lastHitEnergy = rms;
    state.armed = false;
    return { frame: currentFrame, energy: rms };
  }
  return null;
}
