<script setup lang="ts">
	import { computed } from "vue";
	import config, { Instrument } from "../../config";
	import { useI18n } from "../../services/i18n";
	import { Pattern } from "../../state/pattern";
	import { SILENT_STROKES, type Difficulty } from "../../services/practiceScorer";
	import { PracticeState, PracticeMode } from "../../services/practiceEngine";
	import HybridPopoverButton from "../utils/hybrid-popover-button.vue";
	import LatencySlider from "./latency-slider.vue";
	import SensitivitySlider from "./sensitivity-slider.vue";
	import DifficultySelector from "./difficulty-selector.vue";
	import SpeedSlider from "./speed-slider.vue";
	import type { PartOption } from "./practiceParts";

	const props = defineProps<{
		pattern: Pattern | undefined;
		parts: PartOption[];
		patternName: string;
		instrument: Instrument;
		mode: PracticeMode;
		state: PracticeState;
		latencyMs: number;
		sensitivity: number;
		difficulty: Difficulty;
		speedBpm: number;
		disabled?: boolean;
	}>();

	const emit = defineEmits<{
		"update:patternName": [v: string];
		"update:instrument": [v: Instrument];
		"update:mode": [v: PracticeMode];
		"update:latencyMs": [v: number];
		"update:sensitivity": [v: number];
		"update:difficulty": [v: Difficulty];
		"update:speedBpm": [v: number];
		"start": [];
		"stop": [];
		"calibrate": [];
	}>();

	const i18n = useI18n();

	const instrumentEnabled = (instr: Instrument) => {
		if (!props.pattern) return false;
		const line = props.pattern[instr] ?? [];
		return line.some((s) => !SILENT_STROKES.has(s ?? ""));
	};

	const isRunning = computed(() => ["countIn", "gameOn", "finalising", "requestingMic"].includes(props.state));
	const buttonLabel = computed(() => isRunning.value
		? i18n.t("practice.toolbar.stop")
		: i18n.t("practice.toolbar.start"));
	const buttonClass = computed(() => isRunning.value ? "btn-danger" : "btn-success");
</script>

<template>
	<div class="bb-practice-toolbar">
		<button
			type="button"
			class="btn btn-lg flex-grow-1 flex-md-grow-0"
			:class="buttonClass"
			:disabled="props.disabled && !isRunning"
			@click="isRunning ? emit('stop') : emit('start')"
		>
			<fa :icon="isRunning ? 'stop' : 'play'" /> {{ buttonLabel }}
		</button>

		<select id="bb-practice-part-select" class="form-select form-select-sm bb-practice-part-picker" :aria-label="i18n.t('practice.toolbar.part')" :value="patternName" @change="emit('update:patternName', ($event.target as HTMLSelectElement).value)">
			<option v-for="p in parts" :key="p.key" :value="p.key">{{ p.label }}</option>
		</select>

		<select id="bb-practice-instrument-select" class="form-select form-select-sm bb-practice-instrument-picker" :aria-label="i18n.t('practice.toolbar.instrument')" :value="instrument" @change="emit('update:instrument', ($event.target as HTMLSelectElement).value as Instrument)">
			<option
				v-for="k in config.instrumentKeys"
				:key="k"
				:value="k"
				:disabled="!instrumentEnabled(k)"
			>{{ config.instruments[k].name() }}{{ !instrumentEnabled(k) ? ' (–)' : '' }}</option>
		</select>

		<div class="btn-group" role="group">
			<input type="radio" class="btn-check" id="mode-instr" :checked="mode === 'instrument'" @change="emit('update:mode', 'instrument')">
			<label class="btn btn-outline-secondary btn-sm" for="mode-instr">{{ i18n.t("practice.toolbar.modeInstrument") }}</label>
			<input type="radio" class="btn-check" id="mode-band" :checked="mode === 'band'" @change="emit('update:mode', 'band')">
			<label class="btn btn-outline-secondary btn-sm" for="mode-band">{{ i18n.t("practice.toolbar.modeBand") }}</label>
		</div>

		<HybridPopoverButton variant="outline-secondary" :title="i18n.t('practice.settings.title')" class="btn-sm">
			<template #button><fa icon="cog" /></template>
			<SpeedSlider :modelValue="speedBpm" :defaultSpeed="pattern?.speed ?? config.defaultSpeed" @update:modelValue="emit('update:speedBpm', $event)" />
			<LatencySlider class="mt-2" :modelValue="latencyMs" @update:modelValue="emit('update:latencyMs', $event)" @calibrate="emit('calibrate')" />
			<SensitivitySlider class="mt-2" :modelValue="sensitivity" @update:modelValue="emit('update:sensitivity', $event)" />
			<DifficultySelector class="mt-2" :modelValue="difficulty" @update:modelValue="emit('update:difficulty', $event)" />
		</HybridPopoverButton>
	</div>
</template>

<style lang="scss">
	.bb-practice-toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		padding: 8px;
		background: var(--bs-tertiary-bg);
		border-bottom: 1px solid var(--bs-border-color);

		// Wrap order: Start always first, ⚙ popover always last.
		// Middle children (instrument select, mode toggle) wrap between them.
		> :first-child { order: -1; }
		> :last-child  { order:  1; }
	}
	.bb-practice-instrument-picker { width: auto; }
	.bb-practice-part-picker { width: auto; }
</style>
