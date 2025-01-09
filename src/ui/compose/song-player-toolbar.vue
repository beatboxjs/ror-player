<script setup lang="ts">
	import { getSongName } from "../../state/state";
	import { BeatboxReference, getPlayerById } from "../../services/player";
	import { clearSong } from "../../state/song";
	import { showConfirm } from "../utils/alert";
	import PlaybackSettingsPicker from "../playback-settings/playback-settings-picker.vue";
	import ImportDialog from "./import-dialog.vue";
	import ShareDialog from "./share-dialog.vue";
	import { injectStateRequired } from "../../services/state";
	import { computed, ref } from "vue";
	import SongPicker from "./song-picker.vue";
	import PlayPauseStopButton from "../play-pause-stop-button.vue";
	import { download, ExportType } from "../utils/export";
	import { useI18n } from "../../services/i18n";

	const props = defineProps<{
		player: BeatboxReference;
		songIdx: number;
	}>();

	const emit = defineEmits<{
		"update:songIdx": [songIdx: number];
	}>();

	const i18n = useI18n();

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
		if(await showConfirm({
			title: i18n.t("song-player-toolbar.clear-song-title"),
			message: i18n.t("song-player-toolbar.clear-song-message"),
			variant: "danger",
			okLabel: i18n.t("song-player-toolbar.clear-song-ok")
		})) {
			clearSong(song.value);
		}
	};

	const handleDownload = (type: ExportType) => {
		download({
			type,
			filename: getSongName(state.value, songIdx.value)!,
			player: getPlayerById(props.player.id)
		});
	};
</script>

<template>
	<div class="bb-song-player-toolbar">
		<PlayPauseStopButton :player="props.player" />
		<PlaybackSettingsPicker v-model="state.playbackSettings" tooltip-placement="bottom" />

		<div class="divider"></div>

		<SongPicker v-model="songIdx"/>

		<div class="dropdown">
			<button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
				<fa icon="cog"/><span class="d-none d-sm-inline">{{" "}}{{i18n.t("song-player-toolbar.tools")}}</span>
			</button>
			<ul class="dropdown-menu">
				<li><a class="dropdown-item" href="javascript:" @click="handleClearSong()" draggable="false"><fa icon="trash" fixed-width/>{{" "}}{{i18n.t("song-player-toolbar.clear-song")}}</a></li>
				<li><a class="dropdown-item" href="javascript:" @click="handleDownload(ExportType.MP3)" draggable="false"><fa icon="file-export" fixed-width/>{{" "}}{{i18n.t("song-player-toolbar.export-mp3")}}</a></li>
				<li><a class="dropdown-item" href="javascript:" @click="handleDownload(ExportType.WAV)" draggable="false"><fa icon="file-export" fixed-width/>{{" "}}{{i18n.t("song-player-toolbar.export-wav")}}</a></li>
				<li><a class="dropdown-item" href="javascript:" @click="showShareDialog = true" draggable="false"><fa icon="share" fixed-width/>{{" "}}{{i18n.t("song-player-toolbar.share")}}</a></li>
				<li><a class="dropdown-item" href="javascript:" @click="showImportDialog = true" draggable="false"><fa icon="file-import" fixed-width/>{{" "}}{{i18n.t("song-player-toolbar.import")}}</a></li>
			</ul>
		</div>

		<slot name="after-actions" />

		<div class="flex-grow-1"></div>

		<slot name="right" />

		<ShareDialog v-if="showShareDialog" @hidden="showShareDialog = false"/>
		<ImportDialog v-if="showImportDialog" @hidden="showImportDialog = false"/>
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