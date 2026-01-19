<script lang="ts">
	import { computed } from 'vue';
	import { Instrument } from '../../config';
	import { PlaybackSettings } from '../../state/playbackSettings';

	const SURDOS: Instrument[] = ["ls", "ms", "hs"];
	const MAIN_SURDO: Instrument = "ms";
</script>
<script setup lang="ts">

	const props = defineProps<{
		instrument: Instrument;
		playbackSettings: PlaybackSettings;
		/** If true, the low and high surdo headphones will be hidden while inactive and the mid surdo will control them all at once. */
		groupSurdos?: boolean;
	}>();

	const emit = defineEmits<{
		"update:playbackSettings": [playbackSettings: PlaybackSettings];
	}>();

	const groupSurdos = computed(() => props.groupSurdos && !SURDOS.some((instr) => props.playbackSettings.headphones.includes(instr)));
	const hide = computed(() => groupSurdos.value && props.instrument !== MAIN_SURDO && SURDOS.includes(props.instrument));
	const instruments = computed(() => groupSurdos.value && props.instrument === MAIN_SURDO ? SURDOS : [props.instrument]);
	const isActive = computed(() => props.playbackSettings.headphones.includes(props.instrument));
	const isOnly = computed(() => isActive.value && props.playbackSettings.headphones.length === 1);

	const handleClick = ($event: MouseEvent) => {
		const extend = $event.ctrlKey || $event.shiftKey;

		emit("update:playbackSettings", {
			...props.playbackSettings,
			headphones: extend ? [
				...props.playbackSettings.headphones.filter((instr) => !instruments.value.includes(instr)),
				...(isActive.value ? [] : instruments.value)
			] : (
				isOnly.value ? [] : [...instruments.value]
			)
		});
	};
</script>

<template>
	<a v-if="!hide" class="bb-headphones-button" href="javascript:" @click="handleClick" :class="isActive ? 'active' : 'inactive'" draggable="false"><fa icon="headphones"/></a>
</template>

<style lang="scss">
	.bb-headphones-button.inactive {
		color: var(--bb-disabled-link-color);
	}
</style>