<script lang="ts">
	/**
	 * Renders a small player that has the given example song shown as pattern placeholders, with a play/pause button and
	 * an export to MP3 button.
	 */
	export default {};
</script>

<script lang="ts" setup>
	import { computed, ref } from "vue";
	import { getPatternFromState } from "../../state/state";
	import { songToBeatbox, stopAllPlayers } from "../../services/player";
	import { PlaybackSettings } from "../../state/playbackSettings";
	import config from "../../config";
	import { allInstruments, getEffectiveSongLength, SongParts } from "../../state/song";
	import { ExampleSong } from "../../state/tune";
	import { injectStateRequired } from "../../services/state";
	import vTooltip from "../utils/tooltip";
	import { download, ExportType } from "../utils/export";
	import AbstractPlayer, { PositionData } from "../utils/abstract-player.vue";
	import { getLocalizedDisplayName, useI18n } from "../../services/i18n";

	const state = injectStateRequired();

	const props = defineProps<{
		tuneName: string;
		song: ExampleSong;
		settings?: PlaybackSettings;
	}>();

	const i18n = useI18n();

	const playbackSettings = computed(() => props.settings || state.value.playbackSettings);

	const songRef = ref<HTMLElement | null>(null);
	const abstractPlayerRef = ref<InstanceType<typeof AbstractPlayer>>();

	const normalizedSong = computed((): Array<Required<Exclude<ExampleSong[0], string>>> => {
		const normalizedSongParts = props.song.flatMap((part) => {
			const result = {
				tuneName: props.tuneName,
				...(typeof part === "string" ? { patternName: part } : part)
			};
			const pattern = getPatternFromState(state.value, result.tuneName, result.patternName);
			if(!pattern)
				return [];
			else {
				return [{
					length: pattern.length,
					instruments: config.instrumentKeys,
					...result
				}];
			}
		});

		if (config.startSongWithWhistleIn) {
			const whistleInPattern = getPatternFromState(state.value, "General Breaks", "Whistle in");
			if (whistleInPattern) {
				return [{
					tuneName: "General Breaks",
					patternName: "Whistle in",
					instruments: config.instrumentKeys,
					length: whistleInPattern.length,
				}, ...normalizedSongParts];
			}
		}

		return normalizedSongParts;
	});

	const songParts = computed((): SongParts => {
		const result = {} as SongParts;
		let i = 0;
		for(const part of normalizedSong.value) {
			result[i] = allInstruments([ part.tuneName, part.patternName ], part.instruments);
			i += part.length / 4;
		}
		return result;
	});

	const rawPattern = computed(() => songToBeatbox(songParts.value, state.value, playbackSettings.value));

	const playStop = () => {
		const p = abstractPlayerRef.value!.getOrCreatePlayer();
		if(!p.playing) {
			stopAllPlayers();
			p.play();
		} else {
			p.stop();
			p.setPosition(0);
		}
	};

	const setPosition = ($event: MouseEvent) => {
		const length = 4 * getEffectiveSongLength(songParts.value, state.value);
		const el = songRef.value!;
		const rect = el.getBoundingClientRect();
		const percent = (el.scrollLeft + $event.clientX - rect.left) / el.scrollWidth;
		abstractPlayerRef.value!.setBeat(percent * length);
	};

	const getPositionMarkerLeft = ({ position, player }: PositionData<false>) => (position / player._pattern.length) * songRef.value!.scrollWidth;

	const handleDownload = () => {
		download({
			type: ExportType.MP3,
			filename: props.tuneName,
			player: abstractPlayerRef.value!.getOrCreatePlayer()
		});
	};
</script>

<template>
	<div class="bb-example-song">
		<div class="song" @click="setPosition($event)" ref="songRef">
			<div v-for="(part, i) in normalizedSong" :key="i" class="card" :style="{ width: `${2.5 * part.length }em` }">
				<span class="tune-name">{{getLocalizedDisplayName(state.tunes[part.tuneName].displayName || part.tuneName)}}</span>
				<span class="pattern-name">{{getLocalizedDisplayName(state.tunes[part.tuneName].patterns[part.patternName].displayName || part.patternName)}}</span>
			</div>

			<AbstractPlayer
				:rawPattern="rawPattern"
				:playbackSettings="playbackSettings"
				:getLeft="getPositionMarkerLeft"
				ref="abstractPlayerRef"
			/>
		</div>
		<ul class="actions icon-list">
			<li><a href="javascript:" v-tooltip="i18n.t('example-song-player.listen')" @click="playStop()" draggable="false"><fa :icon="abstractPlayerRef?.playerRef?.playing ? 'stop' : 'play-circle'"/></a></li>
			<li><a href="javascript:" v-tooltip="i18n.t('example-song-player.download-mp3')" @click="handleDownload()" draggable="false"><fa icon="download"/></a></li>
		</ul>
	</div>
</template>

<style lang="scss">
	.bb-example-song {
		position: relative;

		.song {
			display: flex;
			position: relative;
			overflow-x: auto;
			padding: 3px 0;

			.card {
				padding: 0 12px;
				white-space: nowrap;
				flex-shrink: 0;
				cursor: col-resize;

				.card-body {
					padding: 0;
				}

				.tune-name {
					font-weight: bold;
				}
			}
		}

		.actions {
			position: absolute;
			padding: 3px 5px;
			top: 8px;
			right: 2px;
			font-size: 28px;
			line-height: 28px;
			display: flex;
			align-items: center;
			border-radius: 5px;
			background-color: rgba(255, 255, 255, 0.8);
			transition: background-color .3s;
			box-shadow: 0 0 2px #fff, 0 0 5px #fff, 0 0 10px #fff;

			li {
				opacity: 0.5;
				transition: opacity 0.3s;
			}

			&:hover {
				background-color: rgba(255, 255, 255, 1);

				li {
					opacity: 1;
				}
			}

			> *:not(:first-child) {
				margin-left: 7px;
			}
		}
	}
</style>