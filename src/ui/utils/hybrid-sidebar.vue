<script lang="ts">
	/**
	 * Renders its children, except on small screens, where it renders a sidebar that slides in from the left
	 * and can be slid out by dragging or by clicking the backdrop.
	 */
	export default {};
</script>

<script setup lang="ts">
	import { computed, ref, TeleportProps } from 'vue';
	import { useMaxBreakpoint } from '../../services/bootstrap';
	import Backdrop from "./backdrop.vue";

	const props = defineProps<{
		isExpanded: boolean;
		toggleContainer?: TeleportProps['to'];
	}>();

	const emit = defineEmits<{
		"update:isExpanded": [isVisible: boolean];
	}>();

	const shouldUseExpand = useMaxBreakpoint("sm");

	const isExpanded = computed({
		get: () => props.isExpanded,
		set: (isVisible) => {
			emit("update:isExpanded", isVisible);
		}
	});

	const containerRef = ref<HTMLElement | null>(null);
	const touchStartX = ref<number | null>(null);

	const handleTouchStart = (event: TouchEvent) => {
		if(event.touches && event.touches[0]) {
			touchStartX.value = event.touches[0].clientX;
			Object.assign(containerRef.value!.style, { transition: "none" });
		}
	};

	const handleTouchMove = (event: TouchEvent) => {
		if(touchStartX.value != null && event.touches[0]) {
			const left = Math.min(event.touches[0].clientX - touchStartX.value, 0);
			Object.assign(containerRef.value!.style, { left: `${left}px` });
		}
	};

	const handleTouchEnd = (event: TouchEvent) => {
		if(touchStartX.value != null && event.changedTouches[0]) {
			Object.assign(containerRef.value!.style, {
				left: "",
				transition: ""
			});

			const left = Math.min(event.changedTouches[0].clientX - touchStartX.value, 0);
			if(left < -containerRef.value!.offsetWidth / 2)
				isExpanded.value = false;

			touchStartX.value = null;
		}
	};
</script>

<template>
	<div
		class="bb-hybrid-sidebar"
		:class="{ shouldUseExpand, isExpanded }"
		v-touch:press="handleTouchStart"
		v-touch:drag="handleTouchMove"
		v-touch:release="handleTouchEnd"
		ref="containerRef"
	>
		<slot />

		<template v-if="shouldUseExpand">
			<Teleport :disabled="!props.toggleContainer" :to="props.toggleContainer">
				<slot name="toggle" v-if="shouldUseExpand" />
			</Teleport>

			<Teleport to="body">
				<Backdrop :isVisible="isExpanded" @click="isExpanded = false" />
			</Teleport>
		</template>
	</div>
</template>

<style lang="scss">
	.bb-hybrid-sidebar {
		padding: 1.2em;
		width: 20em;
		background: var(--bs-body-bg);
		border-right: 1px solid var(--bs-border-color);
		display: flex;
		flex-direction: column;

		&.shouldUseExpand {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			transition: left .3s;
			z-index: 999;

			&:not(.isExpanded) {
				left: -20em;
			}
		}
	}
</style>