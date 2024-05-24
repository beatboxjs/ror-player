<script setup lang="ts">
	import PatternLengthPicker from "./pattern-length-picker.vue";
	import TimeSignaturePicker from "./time-signature-picker.vue";
	import UpbeatPicker from "./upbeat-picker.vue";
	import PlaybackSettingsPicker from "../playback-settings/playback-settings-picker.vue";
	import { BeatboxReference } from "../../services/player";
	import { computed } from "vue";
	import { PlaybackSettings } from "../../state/playbackSettings";
	import { getPatternFromState } from "../../state/state";
	import { injectStateRequired } from "../../services/state";
	import { updatePattern } from "../../state/pattern";
	import defaultTunes from "../../defaultTunes";
	import PlayPauseStopButton from "../play-pause-stop-button.vue";

	const props = withDefaults(defineProps<{
		tuneName: string;
		patternName: string;
		player: BeatboxReference;
		playbackSettings: PlaybackSettings;
		readonly?: boolean;
	}>(), {
		readonly: false
	});

	const emit = defineEmits<{
		"update:playbackSettings": [playbackSettings: PlaybackSettings];
	}>();

	const state = injectStateRequired();

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName)!);
	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const playbackSettings = computed({
		get: () => props.playbackSettings,
		set: (value) => {
			emit("update:playbackSettings", value);
		}
	});

	const handleUpdatePattern = (update: Parameters<typeof updatePattern>[1]) => {
		updatePattern(pattern.value, update);
	};
</script>

<template>
	<div class="bb-pattern-editor-toolbar">
		<PlayPauseStopButton :player="props.player" />
		<PlaybackSettingsPicker v-model="playbackSettings" :default-speed="pattern.speed" />

		<div class="divider"></div>

		<template v-if="!readonly">
			<div class="btn-group">
				<PatternLengthPicker :modelValue="pattern.length" @update:modelValue="handleUpdatePattern({ length: $event })" :buttonClass="{ 'has-changes': originalPattern && originalPattern.length != pattern.length }"/>
			</div>

			<div class="btn-group">
				<TimeSignaturePicker :modelValue="pattern.time" @update:modelValue="handleUpdatePattern({ time: $event })" :buttonClass="{ 'has-changes': originalPattern && originalPattern.time != pattern.time }" />
			</div>

			<div class="btn-group">
				<UpbeatPicker :modelValue="pattern.upbeat" @update:modelValue="handleUpdatePattern({ upbeat: $event })" :time="pattern.time" :buttonClass="{ 'has-changes': originalPattern && originalPattern.upbeat != pattern.upbeat }" />
			</div>
		</template>

		<slot/>
	</div>
</template>

<style lang="scss">
	.bb-pattern-editor-toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: -0.5rem;

		> * {
			flex-shrink: 0;
			margin-top: 0.5rem;
			margin-right: 0.25rem;
		}

		.divider {
			margin-left: 0.75rem;
			margin-right: 0.5rem;
			height: 34px;
			border-left: 1px solid #dee2e6;
		}

		button.has-changes {
			background: linear-gradient(to bottom, #fdf4e8 0%, #f7d3a1 100%);
			border-color: #f7d3a1;
		}
	}
</style>