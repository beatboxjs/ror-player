<script lang="ts" setup>
	import { computed, nextTick, ref, watch } from "vue";
	import { normalizeState } from "../../state/state";
	import { stopAllPlayers } from "../../services/player";
	import { provideState } from "../../services/state";
	import { injectEventBusRequired } from "../../services/events";
	import PatternListFilter, { Filter, filterPatternList } from "../pattern-list-filter.vue";
	import TuneInfo from "./tune-info.vue";
	import { useRefWithOverride } from "../../utils";
	import { getTuneOfTheYear } from "../../services/utils";

	const props = defineProps<{
		/** null means to forward to the tune of the year */
		tuneName?: string | null;
		editPattern?: string;
	}>();

	const emit = defineEmits<{
		(type: "update:tuneName", tuneName: string | null | undefined): void;
		(type: "update:editPattern", patternName: string | undefined): void;
	}>();

	const tuneName = useRefWithOverride(undefined, () => props.tuneName, (tuneName) => emit("update:tuneName", tuneName));
	const editPattern = useRefWithOverride(undefined, () => props.editPattern, (patternName) => emit("update:editPattern", patternName));

	const state = ref(normalizeState());
	provideState(state);

	const tunesRef = ref<HTMLElement | null>(null);

	const filter = ref<Filter | undefined>(undefined);

	const touchStartX = ref<number | null>(null);

	const tuneList = computed(() => filterPatternList(state.value, filter.value));

	const tuneListRef = ref<HTMLElement | null>(null);

	const eventBus = injectEventBusRequired();

	watch(tuneName, () => {
		eventBus.emit("overview-close-pattern-list");
		stopAllPlayers();

		if (tuneName.value) {
			if(!filterPatternList(state.value, filter.value).includes(tuneName.value))
				filter.value = { text: "", cat: "all" };

			nextTick(() => {
				scrollToTune();
			});
		} else {
			tuneName.value = getTuneOfTheYear();
		}
	}, { immediate: true });

	const scrollToTune = () => {
		tuneListRef.value?.querySelector('.nav-link.active')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	};

	const handleTouchStart = (event: TouchEvent) => {
		if(event.touches && event.touches[0]) {
			touchStartX.value = event.touches[0].clientX;
			Object.assign(tunesRef.value!.style, { transition: "none" });
		}
	};

	const handleTouchMove = (event: TouchEvent) => {
		if(touchStartX.value != null && event.touches[0]) {
			const left = Math.min(event.touches[0].clientX - touchStartX.value, 0);
			Object.assign(tunesRef.value!.style, { left: `${left}px` });
		}
	};

	const handleTouchEnd = (event: TouchEvent) => {
		if(touchStartX.value != null && event.changedTouches[0]) {
			Object.assign(tunesRef.value!.style, {
				left: "",
				transition: ""
			});

			const left = Math.min(event.changedTouches[0].clientX - touchStartX.value, 0);
			if(left < -tunesRef.value!.offsetWidth / 2)
				document.body.classList.remove("bb-pattern-list-visible");

			touchStartX.value = null;
		}
	};
</script>

<template>
	<div class="bb-listen">
		<div class="bb-listen-tunes" v-touch:press="handleTouchStart" v-touch:drag="handleTouchMove" v-touch:release="handleTouchEnd" ref="tunesRef">
			<PatternListFilter v-model="filter" :show-custom="false" />

			<hr />

			<ul class="nav nav-pills flex-column flex-nowrap" ref="tuneListRef">
				<li v-for="thisTuneName in tuneList" :key="thisTuneName" class="nav-item">
					<a class="nav-link" :class="{ active: thisTuneName == tuneName }" href="javascript:" @click="tuneName = thisTuneName" draggable="false">
						{{state.tunes[thisTuneName].displayName || thisTuneName}}
					</a>
				</li>
			</ul>
		</div>

		<div class="bb-listen-info">
			<TuneInfo v-if="tuneName" :tuneName="tuneName" v-model:editPattern="editPattern" />
		</div>
	</div>
</template>

<style lang="scss">
	.bb-listen {
		display: flex;
		flex-grow: 1;
		min-height: 0;

		.bb-listen-tunes {
			padding: 1.2em;
			width: 20em;
			background: #fff;
			border-right: 1px solid #dee2e6;
			display: flex;
			flex-direction: column;

			@media (max-width: 767.98px) {
				position: fixed;
				top: 0;
				left: 0;
				bottom: 0;
				transition: left .3s;
				z-index: 999;

				body:not(.bb-pattern-list-visible) & {
					left: -20em;
				}
			}

			hr {
				/* https://stackoverflow.com/a/34372979/242365 */
				margin-left: 0;
				margin-right: 0;
			}

			> .nav {
				flex-basis: 0;
				flex-grow: 1;
				min-height: 0;
				overflow-y: auto;
				position: relative;
				padding: 0 1.2em 1.2em 1.2em;
				margin: 0 -1.2em -1.2em -1.2em;
			}
		}

		.bb-listen-info {
			width: 0;
			flex-grow: 1;
			padding: 1.2em;
			overflow: auto;

			.bb-tune-info {
				max-width: 740px;
				margin: 0 auto;
			}
		}

		.bb-cover {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 999; /* Under modal dialog (1050) */
			background: rgba(0, 0, 0, 0.4);
			visibility: hidden;
			transition: left .3s;

			@media (max-width: 767.98px) {
				body.bb-pattern-list-visible & {
					left: 20em;
					visibility: visible;
				}
			}
		}
	}
</style>