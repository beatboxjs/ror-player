import { ref, Ref } from "vue";

export type MicPermissionState = "unknown" | "granted" | "denied";

export interface MicPermission {
  state: Ref<MicPermissionState>;
  request(): Promise<MediaStream>;
  release(stream: MediaStream): void;
}

const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 1,
  sampleRate: 48000,
};

export function createMicPermission(): MicPermission {
  const state = ref<MicPermissionState>("unknown");
  return {
    state,
    async request() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
        state.value = "granted";
        return stream;
      } catch (err: any) {
        state.value = "denied";
        throw err;
      }
    },
    release(stream) {
      for (const track of stream.getTracks()) track.stop();
    },
  };
}
