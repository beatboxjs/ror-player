<script setup lang="ts">
	import Collapse from "bootstrap/js/dist/collapse";
	import { onBeforeUnmount, onMounted, ref, watch } from "vue";

	const props = withDefaults(defineProps<{
		height?: number;
		show?: boolean;
	}>(), {
		height: 0,
		show: false
	});

	const containerRef = ref<HTMLElement>();
	const collapseRef = ref<Collapse>();
	const shouldRender = ref(false);

	onMounted(() => {
		collapseRef.value = new Collapse(containerRef.value!, { toggle: false });

		containerRef.value!.addEventListener("show.bs.collapse", () => {
			shouldRender.value = true;
		});
		containerRef.value!.addEventListener("hidden.bs.collapse", () => {
			shouldRender.value = false;
		});

		watch(() => props.show, () => {
			if (props.show) {
				collapseRef.value?.show();
			} else {
				collapseRef.value?.hide();
			}
		}, { immediate: true });
	});

	onBeforeUnmount(() => {
		collapseRef.value?.dispose();
	});
</script>

<template>
	<div ref="containerRef" class="collapse">
		<slot v-if="shouldRender" />
		<div v-else :style="`height: ${height}px`" />
	</div>
</template>