<script lang="ts">
	/**
	 * Renders a small player that has the given example song shown as pattern placeholders, with a play/pause button and
	 * an export to MP3 button.
	 */
	export default {};
</script>

<script lang="ts" setup>
	import { computed, ref, watch } from "vue";
	import { getPatternFromState } from "../../state/state";
	import { BeatboxReference, createBeatbox, getPlayerById, songToBeatbox, stopAllPlayers } from "../../services/player";
	import { PlaybackSettings } from "../../state/playbackSettings";
	import Beatbox from "beatbox.js";
	import config from "../../config";
	import { allInstruments, getEffectiveSongLength, SongParts } from "../../state/song";
	import { scrollToElement } from "../../services/utils";
	import { ExampleSong } from "../../state/tune";
	import { injectStateRequired } from "../../services/state";
	import vTooltip from "../utils/tooltip";
	import Export from "../export.vue";

	const state = injectStateRequired();

	const props = defineProps<{
		tuneName: string;
		song: ExampleSong;
		settings?: PlaybackSettings;
	}>();

	const playbackSettings = computed(() => props.settings || state.value.playbackSettings);

	const playerRef = ref<BeatboxReference>();
	const player = computed(() => playerRef.value && getPlayerById(playerRef.value.id));

	const songRef = ref<HTMLElement | null>(null);
	const positionMarkerRef = ref<HTMLElement | null>(null);

	const normalizedSong = computed((): Array<Required<Exclude<ExampleSong[0], string>>> => props.song.flatMap((part) => {
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
	}));

	const songParts = computed((): SongParts => {
		let i = 1;
		const result = {
			0: allInstruments([ "General Breaks", "Whistle in" ])
		} as SongParts;
		for(const part of normalizedSong.value) {
			result[i] = allInstruments([ part.tuneName, part.patternName ], part.instruments);
			i += part.length / 4;
		}
		return result;
	});

	const getOrCreatePlayer = (): Beatbox => {
		if (!playerRef.value) {
			playerRef.value = createBeatbox(false);
			player.value!.on("beat", (beat: number) => {
				updateMarkerPos(true);
			});
			updatePlayer();
		}
		return player.value!;
	};

	const updatePlayer = () => {
		if(!player.value)
			return;

		let songBeatbox = songToBeatbox(songParts.value, state.value, playbackSettings.value);
		player.value.setPattern(songBeatbox);
		player.value.setUpbeat(songBeatbox.upbeat);
		player.value.setBeatLength(60000/playbackSettings.value.speed/config.playTime);
		player.value.setRepeat(playbackSettings.value.loop);
	};

	watch(() => props.song, updatePlayer, { deep: true });
	watch(playbackSettings, updatePlayer, { deep: true });
	watch(() => state.value.tunes, updatePlayer, { deep: true });

	const playStop = () => {
		const p = getOrCreatePlayer();
		if(!p.playing) {
			stopAllPlayers();
			p.play();
		} else {
			p.stop();
			p.setPosition(0);
		}
	};

	const setPosition = ($event: MouseEvent) => {
		const p = getOrCreatePlayer();
		const length = 4 * getEffectiveSongLength(songParts.value, state.value) * config.playTime + p._upbeat;
		const el = songRef.value!;
		const rect = el.getBoundingClientRect();
		const percent = (el.scrollLeft + $event.clientX - rect.left) / el.scrollWidth;
		p.setPosition(Math.floor(percent * length));
		updateMarkerPos(false);
	};

	const updateMarkerPos = (scroll: boolean) => {
		const p = getOrCreatePlayer();
		positionMarkerRef.value!.style.left = `${(p.getPosition() / p._pattern.length) * songRef.value!.scrollWidth}px`;
		if (scroll) {
			scrollToElement(positionMarkerRef.value!, true);
		}
	};
</script>

<template>
	<div class="bb-example-song">
		<div class="song" @click="setPosition($event)" ref="songRef">
			<div class="position-marker" v-show="playerRef && playerRef.customPosition" ref="positionMarkerRef"></div>
			<div class="card" style="width: 10em;">
				<span class="tune-name">General Breaks</span>
				<span class="pattern-name">Whistle in</span>
			</div>
			<div v-for="(part, i) in normalizedSong" :key="i" class="card" :style="{ width: `${2.5 * part.length }em` }">
				<span class="tune-name">{{state.tunes[part.tuneName].displayName || part.tuneName}}</span>
				<span class="pattern-name">{{state.tunes[part.tuneName].patterns[part.patternName].displayName || part.patternName}}</span>
			</div>
		</div>
		<ul class="actions icon-list">
			<li><a href="javascript:" v-tooltip="'Listen'" @click="playStop()" draggable="false"><fa :icon="playerRef && playerRef.playing ? 'stop' : 'play-circle'"/></a></li>
			<Export :player="() => { getOrCreatePlayer(); return playerRef!; }" :filename="tuneName" v-slot="{ downloadMP3 }">
				<li><a href="javascript:" v-tooltip="'Download as MP3'" @click="downloadMP3()" draggable="false"><fa icon="download"/></a></li>
			</Export>
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

			.position-marker {
				position: absolute;
				top: 0;
				height: 100%;
				border-left: 1px solid #000;
				transition: left 0.1s linear;
				pointer-events: none;
				z-index: 1;
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