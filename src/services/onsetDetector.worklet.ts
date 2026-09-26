/// <reference types="@types/audioworklet" />
import { createDetectorState, processBlock, DetectorParams, DetectorState, DEFAULT_DETECTOR_PARAMS, effectiveMultiplier } from "./onsetDetectorCore";

interface WorkletMessage {
  type: "onset";
  t_ctx: number;
  energy: number;
}

class OnsetDetectorProcessor extends AudioWorkletProcessor {
  state: DetectorState;
  frame: number = 0;
  userSensitivity: number;
  baseMultiplier: number;

  constructor(options: AudioWorkletNodeOptions) {
    super();
    const params = (options.processorOptions ?? {}) as Partial<DetectorParams> & { userSensitivity?: number };
    this.userSensitivity = params.userSensitivity ?? DEFAULT_DETECTOR_PARAMS.userSensitivity;
    this.baseMultiplier = params.multiplier ?? DEFAULT_DETECTOR_PARAMS.multiplier;
    this.state = createDetectorState({
      multiplier: effectiveMultiplier(this.baseMultiplier, this.userSensitivity),
      refractoryFrames: params.refractoryFrames ?? DEFAULT_DETECTOR_PARAMS.refractoryFrames, // ~50 ms at 48kHz, 128-sample blocks
    });

    this.port.onmessage = (e: MessageEvent) => {
      if (e.data?.type === "setSensitivity") {
        this.userSensitivity = e.data.value;
        this.state.params.multiplier = effectiveMultiplier(e.data.baseMultiplier ?? this.baseMultiplier, this.userSensitivity);
      }
    };
  }

  process(inputs: Float32Array[][]): boolean {
    const ch = inputs[0]?.[0];
    if (!ch) return true;
    const event = processBlock(this.state, ch, this.frame);
    this.frame++;
    if (event) {
      const msg: WorkletMessage = { type: "onset", t_ctx: currentTime, energy: event.energy };
      this.port.postMessage(msg);
    }
    return true;
  }
}

registerProcessor("onset-detector", OnsetDetectorProcessor);
