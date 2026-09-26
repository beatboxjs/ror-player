export interface MedianStats {
  median: number;
  /** Median absolute deviation, used as "spread" indicator */
  spread: number;
  count: number;
}

export function computeMedianAndSpread(values: number[]): MedianStats {
  if (values.length === 0) return { median: 0, spread: 0, count: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;

  const deviations = sorted.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
  const devMid = Math.floor(deviations.length / 2);
  const mad = deviations.length % 2 === 1
    ? deviations[devMid]
    : (deviations[devMid - 1] + deviations[devMid]) / 2;

  return { median, spread: mad, count: values.length };
}

export interface CalibrationSession {
  recordTap(timestampMs: number): void;
  finalize(): MedianStats;
}

export function createCalibrationSession(
  beats: number[],
  opts: { windowMs?: number } = {},
): CalibrationSession {
  const windowMs = opts.windowMs ?? 300;
  const deltas: number[] = [];
  return {
    recordTap(t) {
      let bestAbs = Infinity;
      let bestDelta = 0;
      for (const b of beats) {
        const d = t - b;
        if (Math.abs(d) < bestAbs) { bestAbs = Math.abs(d); bestDelta = d; }
      }
      if (bestAbs <= windowMs) deltas.push(bestDelta);
    },
    finalize() {
      return computeMedianAndSpread(deltas);
    },
  };
}
