<script lang="ts" setup>
	import { ref, TeleportProps, watch } from "vue";
	import { normalizeState } from "../../state/state";
	import { stopAllPlayers } from "../../services/player";
	import { provideState } from "../../services/state";
	import TuneInfo from "./tune-info.vue";
	import { useRefWithOverride } from "../../utils";
	import { getTuneOfTheYear } from "../../services/utils";
	import TuneList from "./tune-list.vue";
	import HybridSidebar from "../utils/hybrid-sidebar.vue";

	const props = defineProps<{
		/** null means to forward to the tune of the year */
		tuneName?: string | null;
		editPattern?: string;
		sidebarToggleContainer?: TeleportProps['to'];
	}>();

	const emit = defineEmits<{
		"update:tuneName": [tuneName: string | null | undefined];
		"update:editPattern": [patternName: string | undefined];
	}>();

	const tuneName = useRefWithOverride(undefined, () => props.tuneName, (tuneName) => emit("update:tuneName", tuneName));
	const editPattern = useRefWithOverride(undefined, () => props.editPattern, (patternName) => emit("update:editPattern", patternName));

	const state = ref(normalizeState());
	provideState(state);

	const isSidebarExpanded = ref(false);

	watch(tuneName, () => {
		isSidebarExpanded.value = false;
		stopAllPlayers();

		if (!tuneName.value) {
			tuneName.value = getTuneOfTheYear();
		}
	}, { immediate: true });
</script>

<template>
	<div class="bb-listen">
		<HybridSidebar v-model:isExpanded="isSidebarExpanded" :toggleContainer="sidebarToggleContainer">
			<TuneList v-model:tuneName="tuneName" />

			<template v-slot:toggle>
				<button type="button" class="btn btn-secondary" @click="isSidebarExpanded = !isSidebarExpanded">
					<fa icon="bars" />
				</button>
			</template>
		</HybridSidebar>

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

		.bb-tune-list {
			flex-grow: 1;
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
	}
</style>