<script setup lang="ts">
	import { allInstruments, appendSongPart } from "../../state/song";
	import PatternList from "./pattern-list.vue";
	import { PatternPlaceholderItem } from "../pattern-placeholder.vue";
	import { scrollToElement } from "../../services/utils";
	import { provideState } from "../../services/state";
	import { computed, nextTick, ref, TeleportProps, watch } from "vue";
	import { History } from "../../services/history";
	import vTooltip from "../utils/tooltip";
	import { selectSong } from "../../state/state";
	import HistoryPicker from "./history-picker.vue";
	import SongPlayer from "./song-player.vue";
	import { clone, useRefWithOverride } from "../../utils";
	import HybridSidebar from "../utils/hybrid-sidebar.vue";

	const props = defineProps<{
		history: History;
		expandTune?: string;
		editPattern?: string;
		importData?: string;
		sidebarToggleContainer?: TeleportProps['to'];
	}>();

	const emit = defineEmits<{
		(type: "update:expandTune", tuneName: string | undefined): void;
		(type: "update:editPattern", patternName: string | undefined): void;
		(type: "update:importData", importData: string | undefined): void;
	}>();

	const expandTune = useRefWithOverride(undefined, () => props.expandTune, (tuneName) => emit("update:expandTune", tuneName));
	const editPattern = useRefWithOverride(undefined, () => props.editPattern, (patternName) => emit("update:editPattern", patternName));
	const importData = useRefWithOverride(undefined, () => props.importData, (importData) => emit("update:importData", importData));

	provideState(props.history.state);

	const state = computed(() => props.history.state.value);

	const containerRef = ref<HTMLElement>();
	const songIdx = ref(state.value.songIdx);
	const playbackSettings = ref(clone(state.value.playbackSettings));
	const isSidebarExpanded = ref(false);
	const isDraggingPattern = ref(false);

	watch(isDraggingPattern, () => {
		if (isDraggingPattern.value) {
			isSidebarExpanded.value = false;
		}
	});

	const song = computed(() => state.value.songs[songIdx.value]);
	watch(song, () => {
		if (!song.value) {
			songIdx.value = state.value.songs.length - 1;
			selectSong(state.value, songIdx.value);
		}
	}, { immediate: true });

	watch(songIdx, () => {
		selectSong(state.value, songIdx.value);
	});

	watch(playbackSettings, () => {
		state.value.playbackSettings = clone(playbackSettings.value);
	}, { deep: true });

	const patternClick = async (tuneName: string, patternName: string) => {
		const song = state.value.songs[songIdx.value];
		if(!song)
			return;

		appendSongPart(song, allInstruments([ tuneName, patternName]), state.value);

		await nextTick();
		scrollToElement(containerRef.value!.querySelector(".bb-song-player .song-container")!, false, true);
	};
</script>

<template>
	<div class="bb-compose" ref="containerRef">
		<HybridSidebar v-model:isExpanded="isSidebarExpanded" :toggleContainer="sidebarToggleContainer">
			<PatternList
				v-slot="slotProps"
				v-model:expandTune="expandTune"
				v-model:editPattern="editPattern"
				v-model:isDraggingPattern="isDraggingPattern"
			>
				<PatternPlaceholderItem><a href="javascript:" v-tooltip="`Add to song`" @click="patternClick(slotProps.tuneName, slotProps.patternName)" draggable="false"><fa icon="plus"/></a></PatternPlaceholderItem>
			</PatternList>

			<template v-slot:toggle>
				<button type="button" class="btn btn-light" @click="isSidebarExpanded = !isSidebarExpanded">
					<fa icon="bars" />
				</button>
			</template>
		</HybridSidebar>

		<div class="bb-compose-song-player">
			<SongPlayer v-model:songIdx="songIdx" v-model:isDraggingPattern="isDraggingPattern">
				<template v-slot:toolbar-right>
					<HistoryPicker :history="history" v-model:importData="importData" />
				</template>
			</SongPlayer>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-compose {
		display: flex;
		flex-grow: 1;
		min-height: 0;

		.bb-compose-song-player {
			flex-grow: 1;
			min-height: 0;
			width: 0;
		}

		.bb-pattern-list-tunes {
			margin-right: -1.2em;
		}
	}
</style>