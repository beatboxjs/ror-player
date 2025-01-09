<script lang="ts" setup>
	import { onBeforeUnmount, onMounted, ref } from "vue";
	import config from "../config";
	import { T, useI18n } from "../services/i18n";

	const i18n = useI18n();

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
	<div class="bb-update" :class="{ show }">
		<div class="alert alert-warning alert-dismissible fade" :class="{ show }" role="alert">
			{{i18n.t("update.new-version", { appName: config.appName })}}<br />
			<T k="update.refresh">
				<template #refresh>
					<a href="javascript:location.reload()" draggable="false">{{i18n.t("update.refresh-refresh")}}</a>
				</template>
			</T>
			<button type="button" class="btn-close" :aria-label="i18n.t('general.dialog-close')" @click="show = false"></button>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-update {
		position: fixed;
		bottom: 20px;
		right: 30px;
		z-index: 1;

		&:not(.show) {
			pointer-events: none;
		}
	}
</style>