<script setup lang="ts">
	import { stopAllPlayers } from "../services/player";
	import { watch } from "vue";
	import { createEventBus, provideEventBus } from "../services/events";
	import Update from "./update.vue";
	import Help from "./help/help.vue";
	import Listen from "./listen/listen.vue";
	import { History } from "../services/history";
	import { useRouter } from "../services/router";
	import Compose from "./compose/compose.vue";
	import { useRefWithOverride } from "../utils";

	const props = defineProps<{
		storage: Record<string, string>;
		path?: string;
	}>();

	const emit = defineEmits<{
		(type: "update:path", path: string): void;
	}>();

	const path = useRefWithOverride("", () => props.path, (path) => emit("update:path", path));

	const route = useRouter(path);

	const eventBus = createEventBus();
	provideEventBus(eventBus);
	const history = new History(props.storage, eventBus);

	eventBus.on("overview-close-pattern-list", () => {
		document.body.classList.remove("bb-pattern-list-visible");
	});

	watch(() => route.value?.tab, () => {
		stopAllPlayers();
	});

	function togglePatternList() {
		document.body.classList.toggle("bb-pattern-list-visible");
	}
</script>

<template>
	<div class="bb-overview">
		<Update />

		<span class="bb-overview-toggle-patternList navbar d-inline-block d-md-none">
			<button class="navbar-toggler" type="button" @click="togglePatternList()">
				<span class="navbar-toggler-icon"></span>
			</button>
		</span>

		<span class="bb-overview-help">
			<Help />
		</span>

		<ul class="nav nav-tabs">
			<li class="nav-item"><a class="nav-link" :class="{ active: route.tab === 'listen' }" href="javascript:" @click="route.tab = 'listen'">Listen</a></li>
			<li class="nav-item"><a class="nav-link" :class="{ active: route.tab === 'compose' }" href="javascript:" @click="route.tab = 'compose'">Compose</a></li>
		</ul>

		<div class="bb-overview-content">
			<template v-if="route.tab === 'listen'">
				<Listen :tuneName="route.tuneName ?? null" @update:tuneName="route.tuneName = $event ?? undefined" v-model:editPattern="route.patternName" />
			</template>

			<template v-if="route.tab === 'compose'">
				<Compose :history="history" v-model:expandTune="route.tuneName" v-model:editPattern="route.patternName" v-model:importData="route.importData" />
			</template>
		</div>

		<div class="bb-cover" @click="togglePatternList()"></div>
	</div>
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
				padding: 0.5em 0.5em 0 5em;
			}
		}

		> .bb-overview-content {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			min-height: 0;
		}

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

			@media (max-width: 767.98px) {
				body.bb-pattern-list-visible & {
					visibility: visible;
				}
			}
		}
	}
</style>