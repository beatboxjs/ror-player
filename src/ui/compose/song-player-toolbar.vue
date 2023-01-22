<script setup lang="ts">
	import { getSongName } from "../../state/state";
	import { BeatboxReference } from "../../services/player";
	import { clearSong } from "../../state/song";
	import { showConfirm } from "../utils/alert";
	import PlaybackSettingsPicker from "../playback-settings/playback-settings-picker.vue";
	import ImportDialog from "./import-dialog.vue";
	import ShareDialog from "./share-dialog.vue";
	import { injectStateRequired } from "../../services/state";
	import { computed, ref } from "vue";
	import SongPicker from "./song-picker.vue";
	import PlayPauseStopButton from "../play-pause-stop-button.vue";
	import Export from "../export.vue";

	const props = defineProps<{
		player: BeatboxReference;
		songIdx: number;
	}>();

	const emit = defineEmits<{
		(type: "update:songIdx", songIdx: number): void;
	}>();

	const state = injectStateRequired();

	const songIdx = computed({
		get: () => props.songIdx,
		set: (songIdx) => {
			emit("update:songIdx", songIdx);
		}
	});

	const song = computed(() => state.value.songs[songIdx.value]);

	const showShareDialog = ref(false);
	const showImportDialog = ref(false);

	const handleClearSong = async () => {
		if(await showConfirm({ title: "Clear song", message: "Do you really want to clear the current song?", variant: "danger" })) {
			clearSong(song.value);
		}
	};

	const songName = computed(() => getSongName(state.value, songIdx.value)!);
</script>

<template>
	<div class="control-panel bb-song-player-toolbar">
		<PlayPauseStopButton :player="props.player" />
		<PlaybackSettingsPicker v-model="state.playbackSettings" tooltip-placement="bottom" />

		<div class="divider"></div>

		<SongPicker v-model="songIdx"/>

		<div class="dropdown">
			<button class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
				<fa icon="cog"/><span class="d-none d-sm-inline"> Tools</span>
			</button>
			<ul class="dropdown-menu">
				<li><a class="dropdown-item" href="javascript:" @click="handleClearSong()" draggable="false"><fa icon="trash" fixed-width/> Clear song</a></li>
				<Export :player="props.player" :filename="songName" v-slot="{ downloadMP3, downloadWAV }">
					<li><a class="dropdown-item" href="javascript:" @click="downloadMP3()" draggable="false"><fa icon="file-export" fixed-width/> Export MP3</a></li>
						<li><a class="dropdown-item" href="javascript:" @click="downloadWAV()" draggable="false"><fa icon="file-export" fixed-width/> Export WAV</a></li>
				</Export>
				<li><a class="dropdown-item" href="javascript:" @click="showShareDialog = true" draggable="false"><fa icon="share" fixed-width/> Share</a></li>
				<li><a class="dropdown-item" href="javascript:" @click="showImportDialog = true" draggable="false"><fa icon="file-import" fixed-width/> Import</a></li>
			</ul>
		</div>

		<slot name="after-actions" />

		<div class="flex-grow-1"></div>

		<slot name="right" />

		<ShareDialog v-model:show="showShareDialog"/>
		<ImportDialog v-model:show="showImportDialog"/>
	</div>
</template>

<style lang="scss">
	.bb-song-player-toolbar {
		padding: 0.75rem 1.25rem 0 1.25rem;
		display: flex;
		align-items: center;
		flex-wrap: wrap;

		> * {
			flex-shrink: 0;
			margin-top: 0.5rem;
			margin-right: 0.25rem;
		}

		> .divider {
			height: 34px;
			margin-left: 0.5rem;
			margin-right: 0.75rem;
			border-left: 1px solid #dee2e6;
		}
	}
</style>