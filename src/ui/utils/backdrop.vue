<script lang="ts">
	/**
	 * Renders a half-transparent backdrop that covers the whole page.
	 */
	export default {};
</script>

<script setup lang="ts">
	const props = defineProps<{
		isVisible: boolean;
	}>();

	const emit = defineEmits<{
		click: [];
	}>();
</script>

<template>
	<div class="bb-cover" :class="{ visible: props.isVisible }" @click="emit('click')"></div>
</template>

<style lang="scss">
	.bb-cover {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 998; /* Under modal dialog (1050) */
		background: rgba(0, 0, 0, 0.4);
		visibility: hidden;
		transition: left .3s;
	}
</style>