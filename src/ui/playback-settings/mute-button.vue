<script setup lang="ts">
	import { computed } from 'vue';
	import config, { Instrument } from '../../config';
	import { PlaybackSettings } from '../../state/playbackSettings';
	import vTooltip from "../utils/tooltip";

	const props = defineProps<{
		instrument: Instrument | "all";
		playbackSettings: PlaybackSettings;
	}>();

	const emit = defineEmits<{
		"update:playbackSettings": [playbackSettings: PlaybackSettings];
	}>();

	const value = computed(() => {
		if (props.instrument === "all") {
			return config.instrumentKeys.every((instr) => props.playbackSettings.mute[instr]);
		} else {
			return props.playbackSettings.mute[props.instrument];
		}
	});

	const handleClick = () => {
		emit("update:playbackSettings", {
			...props.playbackSettings,
			mute: props.instrument === "all" ? (
				Object.fromEntries(config.instrumentKeys.map((instr) => [instr, !value.value]))
			) : ({
				...props.playbackSettings.mute,
				[props.instrument]: !value.value
			})
		});
	};

	const tooltip = computed(() => props.instrument === "all" ? `${value.value ? 'Unmute' : 'Mute'} all instruments` : undefined);
</script>

<template>
	<a class="bb-mute-button" href="javascript:" @click="handleClick()" :class="value ? 'active' : 'inactive'" draggable="false" v-tooltip="tooltip"><fa icon="volume-mute"/></a>
</template>

<style lang="scss">
	.bb-mute-button.inactive {
		color: #bbb;
	}
</style>