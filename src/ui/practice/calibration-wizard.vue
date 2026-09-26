<script setup lang="ts">
	import { ref, computed, onBeforeUnmount, watch } from "vue";
	import { useI18n } from "../../services/i18n";
	import { createLoopbackCalibration, DEFAULT_LOOPBACK_QUALITY } from "../../services/loopbackCalibrator";
	import type { LoopbackCalibration, LoopbackResult } from "../../services/loopbackCalibrator";
	import { createOnsetDetector, ctxTimeToPerfTime } from "../../services/onsetDetector";
	import type { OnsetDetector } from "../../services/onsetDetector";
	import type { MicPermission } from "../../services/mediaPermissions";

	const props = defineProps<{
		open: boolean;
		micPermission: MicPermission;
		detectorFactory?: () => OnsetDetector;
	}>();

	const emit = defineEmits<{
		"update:open": [v: boolean];
		"apply": [offsetMs: number];
	}>();

	const i18n = useI18n();

	type FailReason = "too-few" | "too-noisy" | "worklet" | "mic-denied";

	const phase = ref<"idle" | "listening" | "done" | "failed">("idle");
	const result = ref<LoopbackResult | null>(null);
	const failReason = ref<FailReason | null>(null);

	// Explicit literal keys (not `"fail-" + reason`) so the i18n key audit can find them.
	const FAIL_KEYS: Record<FailReason, string> = {
		"too-few": "practice.calibration.fail-too-few",
		"too-noisy": "practice.calibration.fail-too-noisy",
		"worklet": "practice.calibration.fail-worklet",
		"mic-denied": "practice.calibration.fail-mic-denied",
	};
	const failKey = computed(() => FAIL_KEYS[failReason.value ?? "too-few"]);

	const spreadIsMarginal = computed(() => {
		const s = result.value?.spread ?? 0;
		return s > DEFAULT_LOOPBACK_QUALITY.marginalSpread && s <= DEFAULT_LOOPBACK_QUALITY.maxSpread;
	});

	// Fixed calibration cadence: latency is a hardware property, not musical, so
	// we use a slow, well-separated click train that the nearest-beat matcher
	// can never mis-attribute. 12 clicks at 100 BPM; the first is a noise-floor
	// warm-up throwaway, leaving 11 scored beats.
	const CAL_BPM = 100;
	const CAL_BEATS = 12;
	const LEAD_SEC = 0.3;

	// Hoisted so close()/unmount can release everything mid-session.
	let ctx: AudioContext | null = null;
	let detector: OnsetDetector | null = null;
	let stream: MediaStream | null = null;
	let tickHandle: number | null = null;
	let cal: LoopbackCalibration | null = null;

	function onOnset(e: { t_perf: number; energy: number }) {
		cal?.recordOnset(e.t_perf);
	}

	function onDetectorError(_e: { message: string }) {
		stopAudio();
		failReason.value = "worklet";
		phase.value = "failed";
	}

	function scheduleClick(audioCtx: AudioContext, tCtx: number) {
		const osc = audioCtx.createOscillator();
		osc.frequency.value = 880;
		const gain = audioCtx.createGain();
		gain.gain.setValueAtTime(0.5, tCtx);
		gain.gain.exponentialRampToValueAtTime(0.001, tCtx + 0.08);
		osc.connect(gain).connect(audioCtx.destination);
		osc.start(tCtx);
		osc.stop(tCtx + 0.1);
	}

	function stopAudio() {
		if (tickHandle) { clearTimeout(tickHandle); tickHandle = null; }
		if (detector) {
			detector.off("onset", onOnset);
			detector.off("error", onDetectorError);
			void detector.stop();
			detector = null;
		}
		if (stream) { props.micPermission.release(stream); stream = null; }
		if (ctx) { void ctx.close(); ctx = null; }
		cal = null;
	}

	function finish() {
		const r = cal?.finalize() ?? null;
		stopAudio();
		result.value = r;
		if (r && r.accepted) {
			phase.value = "done";
		} else {
			failReason.value = r?.reason ?? "too-few";
			phase.value = "failed";
		}
	}

	async function start() {
		if (phase.value === "listening") return;
		phase.value = "listening";
		result.value = null;
		failReason.value = null;

		try {
			stream = await props.micPermission.request();
		} catch {
			stopAudio();
			failReason.value = "mic-denied";
			phase.value = "failed";
			return;
		}
		// Cancelled (close → watch ran stopAudio) while awaiting the mic prompt.
		if (phase.value !== "listening") { stopAudio(); return; }

		detector = (props.detectorFactory ?? createOnsetDetector)();
		detector.on("onset", onOnset);
		detector.on("error", onDetectorError);
		try {
			await detector.start(stream, {});
		} catch {
			stopAudio();
			failReason.value = "worklet";
			phase.value = "failed";
			return;
		}
		// Cancelled or errored while awaiting detector startup.
		if (phase.value !== "listening") { stopAudio(); return; }

		ctx = new AudioContext();
		// Strict-autoplay browsers may create the context suspended (user activation can lapse across
		// the mic prompt); resume so the scheduled clicks actually play — else the mic hears nothing
		// and the run fails as a silent "too-few".
		await ctx.resume();
		if (phase.value !== "listening") { stopAudio(); return; }
		const beatSec = 60 / CAL_BPM;
		// Pair currentTime with performance.now() to fix the ctx↔perf offset for click scheduling.
		// getOutputTimestamp() (which the live detector uses mid-stream) is NOT usable here: on a
		// just-created context, before any output has rendered, it reports a 0/empty timestamp.
		const ctxNow = ctx.currentTime;
		const perfAtCtxNow = performance.now();
		const snap = { contextTime: ctxNow, performanceTime: perfAtCtxNow };
		const t0Ctx = ctxNow + LEAD_SEC;

		const beats: number[] = [];
		let lastClickPerf = perfAtCtxNow;
		for (let i = 0; i < CAL_BEATS; i++) {
			const tCtx = t0Ctx + i * beatSec;
			const tPerf = ctxTimeToPerfTime(tCtx, snap);
			lastClickPerf = tPerf;
			if (i > 0) beats.push(tPerf); // i === 0 is the warm-up throwaway
			scheduleClick(ctx, tCtx);
		}
		cal = createLoopbackCalibration(beats);

		// Wait until the last click + a generous round-trip tail has been heard.
		tickHandle = window.setTimeout(finish, lastClickPerf + 700 - performance.now());
	}

	function applyResult() {
		emit("apply", Math.round(result.value?.medianMs ?? 0));
		close();
	}

	function close() {
		emit("update:open", false);
	}

	watch(() => props.open, (open) => {
		if (!open) {
			stopAudio();
			phase.value = "idle";
			result.value = null;
			failReason.value = null;
		}
	});

	onBeforeUnmount(() => {
		stopAudio();
	});
</script>

<template>
	<div v-if="open" class="modal-backdrop show"></div>
	<div v-if="open" class="modal d-block" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{{ i18n.t("practice.calibration.title") }}</h5>
					<button type="button" class="btn-close" @click="close"></button>
				</div>
				<div class="modal-body">
					<p v-if="phase === 'idle'">{{ i18n.t("practice.calibration.idle-instructions") }}</p>
					<p v-else-if="phase === 'listening'">{{ i18n.t("practice.calibration.listening") }}</p>
					<p v-else-if="phase === 'done'">
						{{ i18n.t("practice.calibration.result-median", { median: Math.round(result?.medianMs ?? 0) }) }}<br>
						{{ i18n.t("practice.calibration.result-spread", { spread: Math.round(result?.spread ?? 0) }) }}<br>
						<small v-if="spreadIsMarginal" class="text-warning">{{ i18n.t("practice.calibration.spread-warning") }}</small>
					</p>
					<p v-else-if="phase === 'failed'" class="text-warning">
						{{ i18n.t(failKey) }}
					</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="close">{{ i18n.t("practice.calibration.cancel") }}</button>
					<button v-if="phase === 'idle'" type="button" class="btn btn-primary" @click="start">{{ i18n.t("practice.calibration.start") }}</button>
					<button v-if="phase === 'failed'" type="button" class="btn btn-primary" @click="start">{{ i18n.t("practice.calibration.retry") }}</button>
					<button v-if="phase === 'done'" type="button" class="btn btn-primary" @click="applyResult">
						{{ i18n.t("practice.calibration.apply", { median: Math.round(result?.medianMs ?? 0) }) }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
