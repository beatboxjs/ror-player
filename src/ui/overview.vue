<script setup lang="ts">
	import { stopAllPlayers } from "../services/player";
	import { ref, watch } from "vue";
	import Update from "./update.vue";
	import Help from "./help/help.vue";
	import Listen from "./listen/listen.vue";
	import { History } from "../services/history";
	import { Route, useRouter } from "../services/router";
	import Compose from "./compose/compose.vue";
	import { useRefWithOverride } from "../utils";
	import { useI18n } from "../services/i18n";

	const props = defineProps<{
		storage: Record<string, string>;
		path?: string;
	}>();

	const emit = defineEmits<{
		"update:path": [path: string];
		"update:route": [route: Route];
	}>();

	const i18n = useI18n();

	const path = useRefWithOverride("", () => props.path, (path) => emit("update:path", path));

	const route = useRouter(path);

	watch(route, () => {
		emit("update:route", route.value);
	}, { deep: true, immediate: true });

	const history = new History(props.storage);

	const version = (import.meta.env.APP_VERSION as string | undefined) ?? "dev";

	const sidebarToggleContainer = ref<HTMLElement>();

	watch(() => route.value?.tab, () => {
		stopAllPlayers();
	});
</script>

<template>
	<div class="bb-overview">
		<Update />

		<span class="bb-overview-help">
			<Help />
		</span>

		<div class="nav nav-tabs">
			<span class="bb-sidebar-toggle-container" ref="sidebarToggleContainer"></span>
			<span class="nav-item"><a class="nav-link" :class="{ active: route.tab === 'listen' }" href="javascript:" @click="route.tab = 'listen'">{{i18n.t('overview.listen')}}</a></span>
			<span class="nav-item"><a class="nav-link" :class="{ active: route.tab === 'compose' }" href="javascript:" @click="route.tab = 'compose'">{{i18n.t('overview.compose')}}</a></span>
		</div>

		<div class="bb-overview-content">
			<template v-if="route.tab === 'listen'">
				<Listen
					:tuneName="route.tuneName ?? null"
					@update:tuneName="route.tuneName = $event ?? undefined"
					v-model:editPattern="route.patternName"
					:sidebarToggleContainer="sidebarToggleContainer"
				/>
			</template>

			<template v-if="route.tab === 'compose'">
				<Compose
					:history="history"
					v-model:expandTune="route.tuneName"
					v-model:editPattern="route.patternName"
					v-model:importData="route.importData"
					:sidebarToggleContainer="sidebarToggleContainer"
				/>
			</template>
		</div>
	</div>
	<footer>
		Version {{ version }}. Made by <a href="https://www.rhythms-of-resistance.org/" target="_blank">Rhythms of Resistance</a>, see the code <a href="https://github.com/beatboxjs/ror-player" target="_blank">here</a>.
	</footer>
</template>

<style lang="scss">
	.bb-overview {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		max-height: 100vh;

		.bb-overview-toggle-patternList {
			position: absolute;
			top: 0.5em;
			left: 0.5em;
		}

		.bb-overview-help {
			position: absolute;
			top: 0.5em;
			right: 1em;
		}

		> .nav {
			padding: 1em 1em 0 1em;

			@media (max-width: 767.98px) {
				padding: 0.5em 0.5em 0 0.5em;
			}
		}

		> .bb-overview-content {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			min-height: 0;
		}

		.bb-sidebar-toggle-container > :last-child {
			margin-right: 0.5em;
		}
	}
</style>