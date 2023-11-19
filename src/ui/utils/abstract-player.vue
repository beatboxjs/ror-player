<script setup lang="ts">
	import Beatbox from 'beatbox.js';
	import { computed, onBeforeUnmount, ref, watch, watchSyncEffect } from 'vue';
	import config from '../../config';
	import { BeatboxReference, createBeatbox, getPlayerById, RawPatternWithUpbeat } from '../../services/player';
	import { scrollToElement } from '../../services/utils';
	import { PlaybackSettings } from '../../state/playbackSettings';

	export interface PositionData<Optional extends boolean = true> {
		position: Optional extends false ? number : (number | undefined);
		beat: Optional extends false ? number : (number | undefined);
		player: Beatbox;
	}

	const props = defineProps<{
		player?: BeatboxReference;
		rawPattern: RawPatternWithUpbeat;
		playbackSettings: PlaybackSettings;
		getLeft: (data: PositionData<false>) => number;
	}>();

	const emit = defineEmits<{
		position: [data: PositionData];
	}>();

	const positionMarkerRef = ref<HTMLElement>();

	const playerRef = ref<BeatboxReference>();
	const player = computed(() => playerRef.value && getPlayerById(playerRef.value.id));

	const updatePosition = (scroll: boolean, force = false) => {
		const player = getOrCreatePlayer();
		const rawPosition = player.getPosition();
		const position = player.playing || rawPosition > 0 ? Math.min(rawPosition, player._pattern.length) : undefined;
		const beat = position != null ? (position - player._upbeat)/config.playTime : undefined;
		emit("position", { position, beat, player });
		if (position != null && beat != null) {
			positionMarkerRef.value!.style.left = `${props.getLeft({ position, beat, player })}px`;
			if (scroll) {
				scrollToElement(positionMarkerRef.value!, true, force);
			}
		}
	};

	const handlePlay = () => {
		updatePosition(true, true);
	};

	const handleBeat = () => {
		updatePosition(true);
	};

	const handleStop = () => {
		updatePosition(false);
	};

	const handleSetPosition = () => {
		updatePosition(false);
	};

	watch(() => props.player, () => {
		if (props.player) {
			playerRef.value = props.player;
		}
	}, { immediate: true });

	watchSyncEffect((onCleanup) => {
		if (playerRef.value) {
			const p = player.value!;
			p!.on("play", handlePlay);
			p!.on("beat", handleBeat);
			p!.on("stop", handleStop);
			p!.on("setPosition", handleSetPosition);

			onCleanup(() => {
				p!.off("play", handlePlay);
				p!.off("beat", handleBeat);
				p!.off("stop", handleStop);
				p!.off("setPosition", handleSetPosition);
			});
		}
	});

	const getOrCreatePlayer = (): Beatbox => {
		if (!playerRef.value) {
			playerRef.value = createBeatbox(false);
		}
		return player.value!;
	};

	onBeforeUnmount(() => {
		if (player.value) {
			// Unregister event handlers in case we used an existing player
			player.value.off("play", handlePlay);
			player.value.off("beat", handleBeat);
			player.value.off("stop", handleStop);
			player.value.off("setPosition", handleSetPosition);
		}
	});

	watchSyncEffect(() => {
		if (player.value) {
			player.value.setPattern(props.rawPattern);
			player.value.setUpbeat(props.rawPattern.upbeat);
			player.value.setBeatLength(60000/props.playbackSettings.speed/config.playTime);
			player.value.setRepeat(props.playbackSettings.loop);
		}
	});

	const setPosition = (position: number) => {
		getOrCreatePlayer().setPosition(position);
	};

	const setBeat = (beat: number) => {
		const player = getOrCreatePlayer();
		setPosition(Math.floor(beat * config.playTime + player._upbeat));
	};

	defineExpose({
		setPosition,
		setBeat,
		playerRef,
		getOrCreatePlayer
	});
</script>

<template>
	<div class="bb-position-marker" :class="{ visible: playerRef?.customPosition }" ref="positionMarkerRef"></div>
</template>

<style lang="scss">
	.bb-position-marker {
		position: absolute;
		top: 0;
		height: 100%;
		border-left: 1px solid #000;
		transition: left 0.1s linear;
		pointer-events: none;
		display: none;

		&.visible {
			display: block;
		}
	}
</style>