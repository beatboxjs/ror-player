<script lang="ts">
	/**
	 * Renders a button with a dropdown menu that allows to pick a song from the current state as well as to create, copy, rename
	 * and delete songs.
	 * The selected current song is persisted in the state.
	 */
	export default {};
</script>

<script setup lang="ts">
	import { useI18n } from '../../services/i18n';
	import { injectStateRequired } from '../../services/state';
	import { updateSong } from '../../state/song';
	import { createSong, getSongName, removeSong } from '../../state/state';
	import { clone } from '../../utils';
	import { showConfirm, showPrompt } from '../utils/alert';
	import vTooltip from "../utils/tooltip";

	const props = defineProps<{
		modelValue: number;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [modelValue: number];
	}>();

	const i18n = useI18n();

	const state = injectStateRequired();

	const handleSelectSong = (songIdx: number) => {
		if(props.modelValue == songIdx)
			return;

		stop();

		emit("update:modelValue", songIdx);
	};

	const handleCreateSong = () => {
		stop();

		const idx = createSong(state.value, undefined, undefined, true);
		handleSelectSong(idx);
	};

	const handleRenameSong = async (songIdx: number) => {
		const song = state.value.songs[songIdx];
		const newName = await showPrompt({
			title: () => i18n.t("song-picker.rename-title"),
			initialValue: song.name,
			okLabel: () => i18n.t("song-picker.rename-ok")
		});
		if(newName) {
			updateSong(song, { name: newName });
		}
	};

	const handleCopySong = async (songIdx: number) => {
		const copy = clone(state.value.songs[songIdx]);
		copy.name = copy.name ? i18n.t("song-picker.copy-of-song-name", { name: copy.name }) : i18n.t("song-picker.copy-song-name");
		const newIdx = createSong(state.value, copy, songIdx + 1);
		if (props.modelValue == songIdx) {
			handleSelectSong(newIdx);
		}
	};

	const handleRemoveSong = async (songIdx: number) => {
		if(await showConfirm({
			title: () => i18n.t("song-picker.remove-title"),
			message: () => i18n.t("song-picker.remove-message", { name: getSongName(state.value, songIdx) }),
			variant: "danger",
			okLabel: () => i18n.t("song-picker.remove-ok")
		}))
			removeSong(state.value, songIdx);
	};
</script>

<template>
	<div class="dropdown bb-song-picker">
		<button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
			<fa icon="music"/><span class="d-none d-sm-inline">{{' '}}{{getSongName(state, props.modelValue)}}</span>
		</button>
		<ul class="dropdown-menu">
			<li v-for="(thisSong, idx) in state.songs" :key="idx">
				<ul class="list-unstyled">
					<li class="song-name flex-grow-1">
						<a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleSelectSong(idx)" draggable="false">{{getSongName(state, idx)}}</a>
					</li>
					<li class="rename"><a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleRenameSong(idx)" v-tooltip="i18n.t('song-picker.rename-tooltip')" draggable="false"><fa icon="pencil-alt"/></a></li>
					<li class="copy"><a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleCopySong(idx)" v-tooltip="i18n.t('song-picker.copy-tooltip')" draggable="false"><fa icon="copy"/></a></li>
					<li class="remove"><a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleRemoveSong(idx)" v-tooltip="i18n.t('song-picker.remove-tooltip')" draggable="false"><fa icon="trash"/></a></li>
				</ul>
			</li>
			<li><hr class="dropdown-divider"></li>
			<li><a class="dropdown-item" href="javascript:" @click="handleCreateSong()" draggable="false">{{i18n.t("song-picker.new-song")}}</a></li>
		</ul>
	</div>
</template>

<style lang="scss">
	.bb-song-picker {
		ul {
			min-width: 250px;
		}

		li.rename a, li.copy a, li.remove a {
			padding: 0.25rem;
		}

		li.remove {
			margin-right: 10px;
		}

		.list-unstyled {
			display: flex;
			align-items: center;
		}
	}
</style>