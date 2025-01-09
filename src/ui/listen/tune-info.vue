<script lang="ts" setup>
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
	import { getTuneDescriptionHtml, T, useI18n } from "../../services/i18n";

	const state = injectStateRequired();

	const props = defineProps<{
		tuneName: string;
		editPattern?: string;
	}>();

	const emit = defineEmits<{
		"update:editPattern": [patternName: string | undefined];
	}>();

	const i18n = useI18n();

	const editPattern = useRefWithOverride(undefined, () => props.editPattern, (patternName) => emit("update:editPattern", patternName));

	const tune = computed(() => props.tuneName && state.value.tunes[props.tuneName]);
	const tuneDescriptionHtml = computed(() => {
		if(!defaultTunes[props.tuneName]?.descriptionFilename)
			return null;

		const el = document.createElement("div");
		el.innerHTML = getTuneDescriptionHtml(defaultTunes[props.tuneName].descriptionFilename!);
		for (const link of el.querySelectorAll("a")) {
			link.setAttribute("target", "_blank");
		}
		return el.innerHTML;
	});

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

		<h2>{{i18n.t("tune-info.notation")}}</h2>
		<p>
			<em>
				<T k="tune-info.notation-info">
					<template #pen>
						<fa icon="pen"></fa>
					</template>
				</T>
			</em>
		</p>
		<p v-if="tune.sheet"><a :href="tune.sheet" target="_blank">{{i18n.t("tune-info.tune-sheet-pdf")}}</a></p>

		<div v-if="tune.video">
			<h2>{{i18n.t("tune-info.video")}}</h2>
			<div class="bb-tune-info-video">
				<iframe sandbox="allow-same-origin allow-scripts" :src="tune.video" frameborder="0" allowfullscreen></iframe>
			</div>
		</div>

		<h2 v-if="tuneDescriptionHtml || tune.sheet" class="d-flex align-items-center">
			<span class="flex-grow-1">{{i18n.t("tune-info.sounds")}}</span>
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
			<PatternPlaceholderItem><a href="javascript:" v-tooltip="i18n.t('tune-info.download-mp3')" @click="handleDownload(patternName, getPlayer())" draggable="false"><fa icon="download"/></a></PatternPlaceholderItem>
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