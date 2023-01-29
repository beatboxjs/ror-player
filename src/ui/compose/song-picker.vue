<script lang="ts">
	/**
	 * Renders a button with a dropdown menu that allows to pick a song from the current state as well as to create, copy, rename
	 * and delete songs.
	 * The selected current song is persisted in the state.
	 */
	export default {};
</script>

<script setup lang="ts">
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
		(type: "update:modelValue", modelValue: number): void;
	}>();

	const state = injectStateRequired();

	const handleSelectSong = (songIdx: number) => {
		if(props.modelValue == songIdx)
			return;

		stop();

		emit("update:modelValue", songIdx);
	};

	const handleCreateSong = () => {
		stop();

		createSong(state.value, undefined, undefined, true);
	};

	const handleRenameSong = async (songIdx: number) => {
		const song = state.value.songs[songIdx];
		const newName = await showPrompt({ title: "Enter song name", initialValue: song.name });
		if(newName) {
			updateSong(song, { name: newName });
		}
	};

	const handleCopySong = async (songIdx: number) => {
		const copy = clone(state.value.songs[songIdx]);
		copy.name = copy.name ? "Copy of " + copy.name : "Copy";
		const newIdx = createSong(state.value, copy, songIdx + 1);
		if (props.modelValue == songIdx) {
			handleSelectSong(newIdx);
		}
	};

	const handleRemoveSong = async (songIdx: number) => {
		if(await showConfirm({ title: "Remove song", message: `Do you really want to remove the song ${getSongName(state.value, songIdx)}?`, variant: "danger" }))
			removeSong(state.value, songIdx);
	};
</script>

<template>
	<div class="dropdown bb-song-picker">
		<button class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
			<fa icon="music"/><span class="d-none d-sm-inline">{{' '}}{{getSongName(state, props.modelValue)}}</span>
		</button>
		<ul class="dropdown-menu">
			<li v-for="(thisSong, idx) in state.songs" :key="idx">
				<ul class="list-unstyled">
					<li class="song-name flex-grow-1">
						<a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleSelectSong(idx)" draggable="false">{{getSongName(state, idx)}}</a>
					</li>
					<li class="rename"><a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleRenameSong(idx)" v-tooltip="'Rename'" draggable="false"><fa icon="pencil-alt"/></a></li>
					<li class="copy"><a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleCopySong(idx)" v-tooltip="'Copy'" draggable="false"><fa icon="copy"/></a></li>
					<li class="remove"><a class="dropdown-item" :class="{ active: idx == props.modelValue }" href="javascript:" @click="handleRemoveSong(idx)" v-tooltip="'Remove'" draggable="false"><fa icon="trash"/></a></li>
				</ul>
			</li>
			<li><hr class="dropdown-divider"></li>
			<li><a class="dropdown-item" href="javascript:" @click="handleCreateSong()" draggable="false">New song</a></li>
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