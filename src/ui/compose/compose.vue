<script setup lang="ts">
	import { allInstruments, appendSongPart } from "../../state/song";
	import PatternList from "./pattern-list.vue";
	import { PatternPlaceholderItem } from "../pattern-placeholder.vue";
	import { injectEventBusRequired, useEventBusListener } from "../../services/events";
	import { scrollToElement } from "../../services/utils";
	import { ensurePersistentStorage } from "../../services/localStorage";
	import { provideState } from "../../services/state";
	import { computed, nextTick, ref, watch } from "vue";
	import { History } from "../../services/history";
	import vTooltip from "../utils/tooltip";
	import { selectSong } from "../../state/state";
	import HistoryPicker from "./history-picker.vue";
	import SongPlayer from "./song-player.vue";

	const props = defineProps<{
		history: History;
	}>();

	provideState(props.history.state);

	const state = computed(() => props.history.state.value);
	const eventBus = injectEventBusRequired();

	const containerRef = ref<HTMLElement>();
	const tunesRef = ref<HTMLElement>();
	const touchStartX = ref<number>();
	const songIdx = ref(state.value.songIdx);

	useEventBusListener("pattern-placeholder-drag-start", () => {
		eventBus.emit("overview-close-pattern-list");
	});

	// TODO: Move somewhere else
	ensurePersistentStorage();

	const song = computed(() => state.value.songs[songIdx.value]);
	watch(song, () => {
		if (!song.value) {
			songIdx.value = state.value.songs.length - 1;
			selectSong(state.value, songIdx.value);
		}
	}, { immediate: true });

	const patternClick = async (tuneName: string, patternName: string) => {
		const song = state.value.songs[songIdx.value];
		if(!song)
			return;

		appendSongPart(song, allInstruments([ tuneName, patternName]), state.value);

		await nextTick();
		scrollToElement(containerRef.value!.querySelector(".bb-song-player .song-container")!, false, true);
	};

	const handleTouchStart = (event: TouchEvent) => {
		if(event.touches && event.touches[0] && !(event.target as Element).closest("[draggable=true]")) {
			touchStartX.value = event.touches[0].clientX;
			tunesRef.value!.style.transition = "none";
		}
	};

	const handleTouchMove = (event: TouchEvent) => {
		if(touchStartX.value != null && event.touches[0]) {
			const left = Math.min(event.touches[0].clientX - touchStartX.value, 0);
			tunesRef.value!.style.left = `${left}px`;
		}
	}

	const handleTouchEnd = (event: TouchEvent) => {
		if(touchStartX.value != null && event.changedTouches[0]) {
			Object.assign(tunesRef.value!.style, {
				left: "",
				transition: ""
			});

			const left = Math.min(event.changedTouches[0].clientX - touchStartX.value, 0);
			if(left < -(tunesRef.value!.offsetWidth / 2))
				document.body.classList.remove("bb-pattern-list-visible");

			touchStartX.value = undefined;
		}
	}
</script>

<template>
	<div class="bb-compose" ref="containerRef">
		<div class="bb-compose-tunes" v-touch:start="handleTouchStart" v-touch:moving="handleTouchMove" v-touch:end="handleTouchEnd" ref="tunesRef">
			<PatternList v-slot="slotProps">
				<PatternPlaceholderItem><a href="javascript:" v-tooltip="`Add to song`" @click="patternClick(slotProps.tuneName, slotProps.patternName)" draggable="false"><fa icon="plus"/></a></PatternPlaceholderItem>
			</PatternList>
		</div>
		<div class="bb-compose-song-player">
			<SongPlayer v-model:songIdx="songIdx">
				<HistoryPicker :history="history" />
			</SongPlayer>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-compose {
		display: flex;
		height: 100%;

		.bb-compose-tunes {
			height: 100%;
			width: 20em;
			padding: 1.2em;
			background: #fff;
			border-right: 1px solid #dee2e6;

			@media (max-width: 767.98px) {
				position: fixed;
				top: 0;
				left: 0;
				bottom: 0;
				transition: left .3s;
				z-index: 999;

				body:not(.bb-pattern-list-visible) & {
					left: -20em;
				}
			}
		}

		.bb-compose-song-player {
			flex-grow: 1;
			height: 100%;
			width: 0;
		}

		.bb-pattern-list-tunes {
			margin-right: -1.2em;
		}
	}
</style>