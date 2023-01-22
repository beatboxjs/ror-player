<script lang="ts" setup>
	import { onBeforeUnmount, onMounted, ref } from "vue";
	import config from "../config";

	let show = ref(false);

	const handleMessage = (event: MessageEvent) => {
		if(event.data === "bb-refresh") {
			show.value = true;
		}
	};

	onMounted(() => {
		navigator.serviceWorker.addEventListener("message", handleMessage);
	});

	onBeforeUnmount(() => {
		navigator.serviceWorker.removeEventListener("message", handleMessage);
	});
</script>

<template>
	<div class="bb-update">
		<div class="alert alert-warning alert-dismissible fade" :class="{ show }" role="alert">
			A new version of {{config.appName}} is available.<br />
			<a href="javascript:location.reload()" draggable="false">Refresh the page</a> to update.
			<button type="button" class="btn-close" aria-label="Close" @click="show = false"></button>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-update {
		position: fixed;
		bottom: 20px;
		right: 30px;
		z-index: 1;
	}
</style>