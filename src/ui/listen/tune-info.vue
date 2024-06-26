<script lang="ts">
	import defaultTunes from "../../defaultTunes";
	import config from "../../config";
	import { clone, useRefWithOverride } from "../../utils";
	import { computed, ref, watch } from "vue";
	import { injectStateRequired } from "../../services/state";
	import PlaybackSettingsPicker from "../playback-settings/playback-settings-picker.vue";
	import ExampleSongPlayer from "./example-song-player.vue";
	import PatternPlaceholder, { PatternPlaceholderItem } from "../pattern-placeholder.vue";
	import vTooltip from "../utils/tooltip";
	import { download, ExportType } from "../utils/export";
	import { BeatboxReference, getPlayerById } from "../../services/player";

	export function getTuneDescriptionHtml(tuneName: string): string | null {
		if(!defaultTunes[tuneName])
			return null;

		// Use HTML from default tunes to avoid script injection through bbHistory
		const el = document.createElement("div");
		el.innerHTML = defaultTunes[tuneName].descriptionHtml || "";
		for (const link of el.querySelectorAll("a")) {
			link.setAttribute("target", "_blank");
		}
		return el.innerHTML;
	}
</script>

<script lang="ts" setup>
	const state = injectStateRequired();

	const props = defineProps<{
		tuneName: string;
		editPattern?: string;
	}>();

	const emit = defineEmits<{
		"update:editPattern": [patternName: string | undefined];
	}>();

	const editPattern = useRefWithOverride(undefined, () => props.editPattern, (patternName) => emit("update:editPattern", patternName));

	const tune = computed(() => props.tuneName && state.value.tunes[props.tuneName]);
	const tuneDescriptionHtml = computed(() => getTuneDescriptionHtml(props.tuneName));

	const playbackSettings = ref(clone(state.value.playbackSettings));

	playbackSettings.value.speed = (tune.value && tune.value.speed) || config.defaultSpeed;

	watch(() => props.tuneName, (tuneName, previousTuneName) => {
		if(tune.value) {
			let previousDefaultSpeed = previousTuneName && state.value.tunes[previousTuneName].speed || config.defaultSpeed;
			if(playbackSettings.value.speed == previousDefaultSpeed)
				playbackSettings.value.speed = tune.value.speed || config.defaultSpeed;
		}
	});

	const handleDownload = (patternName: string, playerRef: BeatboxReference) => {
		download({
			type: ExportType.MP3,
			player: getPlayerById(playerRef.id),
			filename: `${props.tuneName} - ${patternName}`
		});
	};

	const handleEditorDialog = (patternName: string, show: boolean) => {
		if (show) {
			editPattern.value = patternName;
		} else if (editPattern.value === patternName) {
			editPattern.value = undefined;
		}
	};
</script>

<template>
	<div class="bb-tune-info" v-if="tune">
		<h1>{{tune.displayName || tuneName}}</h1>

		<div v-html="tuneDescriptionHtml"></div>

		<h2>Notation</h2>
		<p><em>Click on the <fa icon="pen"></fa> on the breaks below to see the notes.</em></p>
		<p v-if="tune.sheet"><a :href="tune.sheet" target="_blank">Tune sheet (PDF)</a></p>

		<div v-if="tune.video">
			<h2>Video</h2>
			<div class="bb-tune-info-video">
				<iframe sandbox="allow-same-origin allow-scripts" :src="tune.video" frameborder="0" allowfullscreen></iframe>
			</div>
		</div>

		<h2 v-if="tune.descriptionHtml || tune.sheet" class="d-flex align-items-center">
			<span class="flex-grow-1">Sounds</span>
			<PlaybackSettingsPicker v-model="playbackSettings" :default-speed="tune.speed" />
		</h2>

		<ExampleSongPlayer
			v-if="tune.exampleSong"
			:tune-name="tuneName"
			:song="tune.exampleSong"
			:settings="playbackSettings"
		/>
		<PatternPlaceholder
			v-for="(pattern, patternName) in tune.patterns"
			:tune-name="tuneName"
			:pattern-name="patternName"
			:readonly="true"
			:key="patternName"
			:settings="playbackSettings"
			v-slot="{ getPlayer }"
			:showEditorDialog="editPattern === patternName"
			@update:showEditorDialog="handleEditorDialog(patternName, $event)"
		>
			<PatternPlaceholderItem><a href="javascript:" v-tooltip="'Download as MP3'" @click="handleDownload(patternName, getPlayer())" draggable="false"><fa icon="download"/></a></PatternPlaceholderItem>
		</PatternPlaceholder>
	</div>
</template>

<style lang="scss">
	.bb-tune-info {
		text-align: justify;

		.bb-pattern-placeholder {
			margin-bottom: .5em;
		}

		.bb-tune-info-video {
			width: 100%;
			padding-top: 56.25%;
			position: relative;

			iframe {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}

		.bb-pattern-placeholder.bb-pattern-placeholder.bb-pattern-placeholder .actions {
			font-size: 28px;
			line-height: 28px;
			top: 0;
			height: 100%;
			display: flex;
			align-items: center;
			background: transparent !important;

			> *:not(:first-child) {
				margin-left: 7px;
			}
		}

		.bb-example-song {
			margin-bottom: 1em;
		}
	}
</style>