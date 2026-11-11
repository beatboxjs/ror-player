/// <reference types="vite/client" />
// eslint-disable-next-line import/default
import workletUrl from "./onsetDetector.worklet.ts?worker&url";
import mitt, { Emitter } from "mitt";
import { DEFAULT_DETECTOR_PARAMS } from "./onsetDetectorCore";

export interface ClockSnapshot {
  contextTime: number;      // seconds
  performanceTime: number;  // ms
}

export type OnsetDetectorEvents = {
  onset: { t_perf: number; energy: number };
  error: { message: string };
} & Record<string, unknown>;

export interface OnsetDetector {
  start(stream: MediaStream, params: { multiplier?: number; refractoryFrames?: number; userSensitivity?: number }): Promise<void>;
  stop(): Promise<void>;
  setSensitivity(value: number): void;
  on<K extends keyof OnsetDetectorEvents>(ev: K, h: (e: OnsetDetectorEvents[K]) => void): void;
  off<K extends keyof OnsetDetectorEvents>(ev: K, h: (e: OnsetDetectorEvents[K]) => void): void;
}

export function ctxTimeToPerfTime(t_ctx: number, snap: ClockSnapshot): number {
  return snap.performanceTime + (t_ctx - snap.contextTime) * 1000;
}

export function createOnsetDetector(): OnsetDetector {
  const events: Emitter<OnsetDetectorEvents> = mitt();
  let ctx: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let node: AudioWorkletNode | null = null;
  let baseMultiplier: number = DEFAULT_DETECTOR_PARAMS.multiplier;

  return {
    async start(stream, params) {
      // Guard against double-start: close any previous context first.
      if (ctx) {
        await ctx.close();
        ctx = null;
      }
      ctx = new AudioContext({ latencyHint: "interactive" });
      try {
        await ctx.audioWorklet.addModule(workletUrl);
      } catch (e: any) {
        events.emit("error", { message: `Worklet load failed: ${e?.message ?? e}` });
        try { await ctx.close(); } catch { /* best-effort */ }
        ctx = null;
        throw e;
      }
      baseMultiplier = params.multiplier ?? DEFAULT_DETECTOR_PARAMS.multiplier;
      node = new AudioWorkletNode(ctx, "onset-detector", {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        processorOptions: {
          multiplier: baseMultiplier,
          refractoryFrames: params.refractoryFrames ?? DEFAULT_DETECTOR_PARAMS.refractoryFrames,
          userSensitivity: params.userSensitivity ?? DEFAULT_DETECTOR_PARAMS.userSensitivity,
        },
      });

      node.port.onmessage = (e: MessageEvent) => {
        if (e.data?.type === "onset") {
          const ts = (ctx as any).getOutputTimestamp ? ctx!.getOutputTimestamp() : null;
          const snap: ClockSnapshot = (ts?.contextTime != null && ts?.performanceTime != null)
            ? { contextTime: ts.contextTime, performanceTime: ts.performanceTime }
            : { contextTime: ctx!.currentTime, performanceTime: performance.now() };
          const t_perf = ctxTimeToPerfTime(e.data.t_ctx, snap);
          events.emit("onset", { t_perf, energy: e.data.energy });
        }
      };

      source = ctx.createMediaStreamSource(stream);
      source.connect(node);
    },
    async stop() {
      try { source?.disconnect(); } catch { /* ignore disconnect errors */ }
      try { node?.disconnect(); } catch { /* ignore disconnect errors */ }
      if (ctx) {
        await ctx.close();
        ctx = null;
      }
      source = null;
      node = null;
    },
    setSensitivity(value) {
      node?.port.postMessage({ type: "setSensitivity", value, baseMultiplier });
    },
    on: (ev, h) => events.on(ev, h),
    off: (ev, h) => events.off(ev, h),
  };
}
