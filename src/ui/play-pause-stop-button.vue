<script setup lang="ts">
	import { computed } from 'vue';
	import { BeatboxReference, getPlayerById, stopAllPlayers } from '../services/player';

	const props = defineProps<{
		player: BeatboxReference;
	}>();

	const player = computed(() => getPlayerById(props.player.id));

	const playPause = () => {
		if(!player.value.playing) {
			stopAllPlayers();
			player.value.play();
		}
		else
			player.value.stop();
	};

	const stop = () => {
		if(player.value.playing)
			player.value.stop();
		player.value.setPosition(0);
	};
</script>

<template>
	<button type="button" class="btn" :class="`btn-${props.player.playing ? 'info' : 'success'}`" @click="playPause()"><fa :icon="props.player.playing ? 'pause' : 'play'"></fa><span class="d-none d-sm-inline">{{' '}}{{props.player.playing ? 'Pause' : 'Play'}}</span></button>
	<button type="button" class="btn btn-danger" @click="stop()"><fa icon="stop"/><span class="d-none d-sm-inline"> Stop</span></button>
</template>