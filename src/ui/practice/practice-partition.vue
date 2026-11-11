<script setup lang="ts">
	import PatternPlayer from "../pattern-player/pattern-player.vue";
	import { type Verdict } from "../../services/practiceScorer";
	import { Instrument } from "../../config";

	defineProps<{
		tuneName: string;
		patternName: string;
		instrument: Instrument;
		verdicts?: Map<number, Verdict>;
	}>();
</script>

<template>
	<div class="bb-practice-partition">
		<PatternPlayer :tuneName="tuneName" :patternName="patternName" :readonly="true" :onlyInstrument="instrument" :verdicts="verdicts" hidePlaybackControls multiLineWhenNarrow />
	</div>
</template>

<style lang="scss">
	.bb-practice-partition {
		padding-left: 12px;

		.bb-pattern-editor-toolbar {
			display: none;
		}

		.stroke {
			&.verdict-good  { background-color: color-mix(in srgb, var(--bs-success) 15%, transparent); }
			&.verdict-off   { background-color: color-mix(in srgb, var(--bs-warning) 15%, transparent); }
			&.verdict-miss  { background-color: color-mix(in srgb, var(--bs-danger) 15%, transparent); text-decoration: line-through; }
			&.verdict-extra { outline: 2px dotted var(--bs-info); outline-offset: -2px; }
		}
	}
</style>
