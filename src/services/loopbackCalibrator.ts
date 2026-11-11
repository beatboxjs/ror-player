import { createCalibrationSession } from "./latencyCalibrator";

export interface LoopbackResult {
	/** median signed delta (detected onset − beat), ms — the round-trip latency */
	medianMs: number;
	/** median absolute deviation of the deltas, ms */
	spread: number;
	/** onsets that matched a beat within the window */
	count: number;
	accepted: boolean;
	reason?: "too-few" | "too-noisy";
}

export interface LoopbackQuality {
	minCount: number;
	maxSpread: number;
	/** Spread above this (and ≤ maxSpread) shows a "noisy calibration" warning. Display-only; does not affect accept/reject. */
	marginalSpread: number;
}

export const DEFAULT_LOOPBACK_QUALITY: LoopbackQuality = { minCount: 8, maxSpread: 25, marginalSpread: 15 };

export interface LoopbackCalibration {
	recordOnset(tPerf: number): void;
	finalize(): LoopbackResult;
}

export function createLoopbackCalibration(
	beats: number[],
	opts: { windowMs?: number; quality?: LoopbackQuality } = {},
): LoopbackCalibration {
	const session = createCalibrationSession(beats, { windowMs: opts.windowMs });
	const quality = opts.quality ?? DEFAULT_LOOPBACK_QUALITY;
	return {
		recordOnset(tPerf) {
			session.recordTap(tPerf);
		},
		finalize() {
			const { median, spread, count } = session.finalize();
			let accepted = true;
			let reason: LoopbackResult["reason"];
			if (count < quality.minCount) {
				accepted = false;
				reason = "too-few";
			} else if (spread > quality.maxSpread) {
				accepted = false;
				reason = "too-noisy";
			}
			return { medianMs: median, spread, count, accepted, reason };
		},
	};
}
