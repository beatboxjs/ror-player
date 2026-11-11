<script setup lang="ts">
	import { ref, computed, onBeforeUnmount, onMounted, TeleportProps, watch } from "vue";
	import { normalizeState, getPatternFromState } from "../../state/state";
	import { provideState } from "../../services/state";
	import { useRefWithOverride } from "../../utils";
	import { useI18n } from "../../services/i18n";
	import { getTuneOfTheYear } from "../../services/utils";
	import { stopAllPlayers } from "../../services/player";
	import config, { Instrument } from "../../config";
	import type { PracticeMode } from "../../services/practiceEngine";
	import { createPracticeEngine } from "../../services/practiceEngine";
	import { createMicPermission } from "../../services/mediaPermissions";
	import { createOnsetDetector } from "../../services/onsetDetector";
	import type { Verdict, Difficulty } from "../../services/practiceScorer";
	import { SILENT_STROKES, extraStrokeIdx } from "../../services/practiceScorer";
	import { loadPracticeSettings } from "../../state/practiceSettings";
	import { reactiveLocalStorage } from "../../services/localStorage";
	import HybridSidebar from "../utils/hybrid-sidebar.vue";
	import TuneList from "../listen/tune-list.vue";
	import CalibrationWizard from "./calibration-wizard.vue";
	import HeadphonesWarning from "./headphones-warning.vue";
	import PermissionDialog from "./permission-dialog.vue";
	import PracticePartition from "./practice-partition.vue";
	import PracticeScoreRail from "./practice-score-rail.vue";
	import PracticeToolbar from "./practice-toolbar.vue";
	import { listParts, resolvePartName } from "./practiceParts";

	const props = defineProps<{
		tuneName?: string;
		patternName?: string;
		sidebarToggleContainer?: TeleportProps['to'];
	}>();

	const emit = defineEmits<{
		"update:tuneName": [tuneName: string | undefined];
		"update:patternName": [patternName: string | undefined];
	}>();

	const i18n = useI18n();

	const tuneName = useRefWithOverride(undefined, () => props.tuneName, (v) => emit("update:tuneName", v));
	const patternName = useRefWithOverride(undefined, () => props.patternName, (v) => emit("update:patternName", v));

	// TuneList emits string | null | undefined; bridge to string | undefined
	const tuneNameForList = computed<string | null | undefined>({
		get: () => tuneName.value,
		set: (v) => { tuneName.value = v ?? undefined; }
	});

	const state = ref(normalizeState());
	provideState(state);

	const isSidebarExpanded = ref(false);

	watch(tuneName, () => {
		isSidebarExpanded.value = false;
		stopAllPlayers();
		if (!tuneName.value) tuneName.value = getTuneOfTheYear();
	}, { immediate: true });

	const tune = computed(() => tuneName.value ? state.value.tunes[tuneName.value] : undefined);
	const patternKeys = computed(() => tune.value ? Object.keys(tune.value.patterns) : []);
	const parts = computed(() => listParts(tune.value));

	// Keep a valid part selected when the tune changes: retain the current part if it
	// still exists, otherwise fall back to "Tune" (or the tune's first part). This is
	// what stops a stale pattern name from dangling when switching to a tune — such as
	// the special break categories — that has no part with the previous name.
	watch(patternKeys, () => {
		patternName.value = resolvePartName(patternKeys.value, patternName.value);
	}, { immediate: true });

	const instrument = ref<Instrument>("sn");
	const mode = ref<PracticeMode>("instrument");
	const latencyMs = ref(0);
	const difficulty = ref<Difficulty>("easy");
	const sensitivity = ref(1);
	const speedBpm = ref(config.defaultSpeed);
	const calibrationOpen = ref(false);
	const permissionOpen = ref(false);
	const headphonesOpen = ref(false);

	const settings = computed({
		get: () => loadPracticeSettings(reactiveLocalStorage.bbPracticeSettings ?? null).settings,
		set: (s) => { reactiveLocalStorage.bbPracticeSettings = JSON.stringify(s); },
	});

	const currentPattern = computed(() => tuneName.value && patternName.value
		? getPatternFromState(state.value, tuneName.value, patternName.value) ?? undefined
		: undefined);

	const hasHits = computed(() => {
		if (!currentPattern.value || !instrument.value) return false;
		return (currentPattern.value[instrument.value] ?? []).some((s) => !SILENT_STROKES.has(s ?? ""));
	});

	const micPermission = createMicPermission();
	const detector = createOnsetDetector();
	const engine = createPracticeEngine({ micPermission, detector }, { latencyOffsetMs: () => latencyMs.value });

	const practiceState = computed(() => engine.state.value);

	// Keep-if-overridden sync: on pattern/tune change, follow the new pattern's default ONLY IF
	// the user hasn't overridden speed (i.e. it still equals the previous pattern's default).
	// Mirrors src/ui/listen/tune-info.vue:47-53. MUST be declared before the configure watcher
	// so Vue runs it first in the same flush, ensuring engine.configure() sees the updated value.
	watch(currentPattern, (newPat, oldPat) => {
		if (!newPat) return;
		const prevDefault = oldPat?.speed ?? config.defaultSpeed;
		if (speedBpm.value === prevDefault) speedBpm.value = newPat.speed;
	}, { immediate: true });

	watch([currentPattern, instrument, mode, speedBpm, difficulty, sensitivity], () => {
		if (currentPattern.value && instrument.value) {
			engine.configure({
				pattern: currentPattern.value,
				instrument: instrument.value,
				speedBpm: speedBpm.value,
				mode: mode.value,
				difficulty: difficulty.value,
				sensitivity: sensitivity.value,
			});
		}
	}, { immediate: true });

	// Apply a sensitivity change live to the running detector (a session restart would otherwise be
	// needed; detector.setSensitivity posts to the worklet, a no-op when no session is active).
	watch(sensitivity, (v) => detector.setSensitivity(v));

	watch([instrument, mode, tuneName, patternName, latencyMs, difficulty, sensitivity], () => {
		settings.value = {
			...settings.value,
			lastInstrument: instrument.value,
			lastMode: mode.value,
			lastTuneName: tuneName.value,
			lastPatternName: patternName.value,
			latencyOffsetMs: latencyMs.value,
			difficulty: difficulty.value,
			sensitivity: sensitivity.value,
		};
	}, { deep: false });

	const s = settings.value;
	if (!props.tuneName && s.lastTuneName) tuneName.value = s.lastTuneName;
	if (!props.patternName) patternName.value = resolvePartName(patternKeys.value, s.lastPatternName);
	if (s.lastInstrument) instrument.value = s.lastInstrument;
	mode.value = s.lastMode;
	latencyMs.value = s.latencyOffsetMs;
	difficulty.value = s.difficulty;
	sensitivity.value = s.sensitivity;

	async function handleStart() {
		if (!settings.value.headphonesWarningAcked) {
			headphonesOpen.value = true;
			return;
		}
		if (!settings.value.micPromptAcked) {
			permissionOpen.value = true;
			return;
		}
		// eslint-disable-next-line no-console
		await engine.start().catch((err) => { console.error("Practice engine failed to start:", err); });
	}

	function confirmHeadphones() {
		settings.value = { ...settings.value, headphonesWarningAcked: true };
		headphonesOpen.value = false;
		void handleStart();
	}

	function confirmPermission() {
		settings.value = { ...settings.value, micPromptAcked: true };
		permissionOpen.value = false;
		// eslint-disable-next-line no-console
		void engine.start().catch((err) => { console.error("Practice engine failed to start:", err); });
	}

	async function handleStop() {
		await engine.stopGame();
	}

	function handleCalibrate() { calibrationOpen.value = true; }
	function applyCalibration(offsetMs: number) { latencyMs.value = offsetMs; }

	const stats = ref(engine.stats());
	// Throttled update via interval (~10 Hz) — could use a watcher on state but stats is non-reactive
	let statsTimer: number | null = null;
	watch(practiceState, (s) => {
		if (statsTimer) { clearInterval(statsTimer); statsTimer = null; }
		// Entering a new session: clear the prior run's final totals immediately. The engine
		// has already torn down its scorer by requestingMic, so engine.stats() reads zeros.
		// Without this the rail keeps showing last session's misses until the first poll lands
		// ~100ms into count-in — the "new session starts with 9 misses" flash.
		if (s === "requestingMic" || s === "countIn") {
			stats.value = engine.stats();
		}
		if (s === "gameOn" || s === "countIn") {
			// Poll stats + verdicts at ~10 Hz. verdictsChanged also pulls verdicts instantly on each
			// hit/wrap; this poll is the catch-up path so a stroke turning into a miss as its window
			// closes (with no new onset) still surfaces. Both pulls are idempotent.
			statsTimer = window.setInterval(() => { stats.value = engine.stats(); pullVerdicts(); }, 100);
		} else if (s === "results") {
			stats.value = engine.stats();
		}
	});

	const verdicts = ref<Map<number, Verdict>>(new Map());
	const recentHits = ref<{ delta: number; verdict: Verdict }[]>([]);
	function pullVerdicts() {
		const v = engine.verdicts();
		const map = new Map<number, Verdict>([...v.perStroke].map(([k, x]) => [k, x.verdict]));
		// Place each stray hit on its nearest cell so the partition shows where it landed — but never
		// overwrite an expected stroke's own good/off/miss verdict.
		const pat = currentPattern.value;
		if (pat) {
			// strokeMs/slotCount MUST match buildExpectedTimeline() in practiceScorer.ts — if they
			// drift, extras would tint the wrong cells while scored strokes stay correct.
			const strokeMs = 60_000 / (speedBpm.value * pat.time);
			const slotCount = pat.length * pat.time + pat.upbeat;
			for (const ex of v.extras) {
				const key = extraStrokeIdx(ex.t, strokeMs, pat.upbeat, slotCount);
				if (key !== null && !map.has(key)) map.set(key, "extra");
			}
		}
		verdicts.value = map;
		recentHits.value = v.recent;
	}

	// Switching the part clears the live feedback so the previous part's stroke
	// highlights don't bleed onto the new part's notation. The running session itself
	// is stopped by the `configure` watcher above: it re-runs engine.configure() when
	// the pattern changes, which calls engine.stop(). That watcher is registered before
	// this one, so on a part change it runs first and sets the engine to "idle" — which
	// is why calling engine.stopGame() here would be a no-op (it early-returns unless
	// the state is "gameOn"/"countIn"). The setup-time part assignments run before this
	// watcher is registered, so they don't trigger a spurious clear.
	watch(patternName, () => {
		verdicts.value = new Map();
		recentHits.value = [];
	});

	watch(practiceState, (s, prev) => {
		if (s === "countIn" && prev !== "countIn") {
			verdicts.value = new Map();
			recentHits.value = [];
		}
	});

	onMounted(() => {
		const raw = reactiveLocalStorage.bbPracticeSettings ?? null;
		const { recovered, settings: recoveredSettings } = loadPracticeSettings(raw);
		if (recovered) reactiveLocalStorage.bbPracticeSettings = JSON.stringify(recoveredSettings);
		engine.on("verdictsChanged", pullVerdicts);
	});

	onBeforeUnmount(() => {
		engine.off("verdictsChanged", pullVerdicts);
		if (statsTimer) { clearInterval(statsTimer); statsTimer = null; }
		void engine.stop();
	});
</script>

<template>
	<div class="bb-practice">
		<HybridSidebar v-model:isExpanded="isSidebarExpanded" :toggleContainer="sidebarToggleContainer" expandBreakpoint="md">
			<TuneList v-model:tuneName="tuneNameForList" />
			<template v-slot:toggle>
				<button type="button" class="btn btn-secondary" @click="isSidebarExpanded = !isSidebarExpanded">
					<fa icon="bars" />
				</button>
			</template>
		</HybridSidebar>

		<div class="bb-practice-main">
			<PracticeScoreRail
					:stats="stats"
					:recentHits="recentHits"
					:micActive="practiceState !== 'idle' && practiceState !== 'results'"
					:latencyMs="latencyMs"
					:state="practiceState"
					:difficulty="difficulty"
					:speedBpm="speedBpm"
					:disabledReason="!hasHits ? i18n.t('practice.no-hits') : undefined"
					v-if="tuneName && patternName"
				/>
			<div v-if="tuneName && patternName" class="bb-practice-pane">
				<PracticeToolbar
					:pattern="currentPattern"
					:parts="parts"
					v-model:patternName="patternName"
					v-model:instrument="instrument"
					v-model:mode="mode"
					v-model:latencyMs="latencyMs"
					v-model:sensitivity="sensitivity"
					v-model:difficulty="difficulty"
					v-model:speedBpm="speedBpm"
					:state="practiceState"
					:disabled="!hasHits"
					@start="handleStart"
					@stop="handleStop"
					@calibrate="handleCalibrate"
				/>
				<PracticePartition v-if="currentPattern" :tuneName="tuneName" :patternName="patternName" :instrument="instrument" :verdicts="verdicts" />
			</div>
			<div v-else class="p-3 text-muted">{{ i18n.t("practice.pick-tune") }}</div>
		</div>

		<CalibrationWizard
			:open="calibrationOpen"
			@update:open="calibrationOpen = $event"
			:micPermission="micPermission"
			@apply="applyCalibration"
		/>
		<PermissionDialog v-model:open="permissionOpen" @confirm="confirmPermission" />
		<HeadphonesWarning v-model:open="headphonesOpen" @confirm="confirmHeadphones" />
		<div class="bb-practice-rotate-overlay">
			<div class="bb-practice-rotate-inner">
				<div class="bb-practice-rotate-glyph">⟳</div>
				<h4>{{ i18n.t("practice.rotate.title") }}</h4>
				<p>{{ i18n.t("practice.rotate.hint") }}</p>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-practice {
		display: flex;
		flex-grow: 1;
		min-height: 0;
		position: relative;

		.bb-tune-list {
			flex-grow: 1;
		}

		.bb-practice-main {
			flex-grow: 1;
			display: flex;
			flex-direction: row;
			min-height: 0;

			.bb-practice-pane {
				flex-grow: 1;
				display: flex;
				flex-direction: column;
				min-height: 0;
				overflow: auto;
			}
		}

		.bb-practice-rotate-overlay { display: none; }
		@media (orientation: portrait) and (max-width: 767.98px) {
			.bb-practice-rotate-overlay {
				display: flex;
				position: absolute;
				inset: 0;
				z-index: 50;
				align-items: center;
				justify-content: center;
				text-align: center;
				padding: 24px;
				background: var(--bs-body-bg);

				.bb-practice-rotate-glyph { font-size: 44px; line-height: 1; margin-bottom: 12px; }
				p { color: var(--bs-secondary-color); font-size: 14px; max-width: 320px; }
			}
		}
	}
</style>
