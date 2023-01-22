<script setup lang="ts">
	import { computed, ref } from "vue";
	import { useEventBusListener } from "../../services/events";
	import { isoDate, readableDate } from "../../services/utils";
	import Popover from "../utils/popover.vue";
	import vTooltip from "../utils/tooltip";
	import { History } from "../../services/history";
	import { showConfirm } from "../utils/alert";

	// TODO
	/*const globalData = Vue.observable({
		// Store this globally because History might not be rendered when link is opened
		showPopover: false
	});

	events.$on("history-load-encoded-string", () => {
		globalData.showPopover = true;

		$(document).one("click", () => {
			globalData.showPopover = false;
		});
	});*/

	const props = defineProps<{
		history: History;
	}>();

	const dropdownRef = ref<HTMLElement>();

	const showPopover = ref(false);

	useEventBusListener("history-load-encoded-string", () => {
		showPopover.value = true;
	});

	const historicStates = computed(() => {
		const states = props.history.getHistoricStates();
		const currentKey = props.history.getCurrentKey();
		return states.map((key, i) => ({
			key,
			readableDate: readableDate(key, states[i-1], states[i+1]),
			isoDate: isoDate(key),
			isCurrent: key == currentKey
		}));
	});

	const handleClear = async () => {
		if (await showConfirm({
			title: "Clear history",
			message: "Are you sure that you want to clear your history? If you have recently opened a shared link, this might lose any custom tunes/breaks/songs that you had previously created.",
			variant: "danger"
		})) {
			props.history.clear()
		}
	};
</script>

<template>
	<div v-if="historicStates.length > 1" class="dropdown bb-history" ref="dropdownRef">
		<button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
			<fa icon="clock"/><span class="d-none d-sm-inline"> History</span>
		</button>
		<ul class="dropdown-menu dropdown-menu-end">
			<li v-for="historicState in historicStates" :key="historicState.key">
				<a
					class="dropdown-item"
					:class="{ active: historicState.isCurrent }"
					href="javascript:"
					@click="props.history.loadHistoricState(historicState.key)"
					v-tooltip="historicState.isoDate"
					draggable="false"
				>{{historicState.readableDate}}</a>
			</li>
			<li><hr class="dropdown-divider"></li>
			<li>
				<a
					class="dropdown-item"
					href="javascript:"
					@click="handleClear()"
					draggable="false"
				>Clear</a>
			</li>
		</ul>
	</div>

	<Popover :element="dropdownRef" v-model:show="showPopover" hide-on-outside-click>
		You have opened a shared view. Your previous songs and tunes can be restored here.
	</Popover>
</template>

<style lang="scss">
	.bb-history {
		.popover {
			z-index: 900; /* Display below dialogs */
		}
	}
</style>