<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { isoDate, readableDate } from "../../services/utils";
	import Popover from "../utils/popover.vue";
	import vTooltip from "../utils/tooltip";
	import { History } from "../../services/history";
	import { showAlert, showConfirm } from "../utils/alert";
	import { useRefWithOverride } from "../../utils";
	import { useI18n } from "../../services/i18n";

	const props = defineProps<{
		history: History;
		importData?: string;
	}>();

	const emit = defineEmits<{
		"update:importData": [importData: string | undefined];
	}>();

	const i18n = useI18n();

	const importData = useRefWithOverride(undefined, () => props.importData, (importData) => emit("update:importData", importData));

	const dropdownRef = ref<HTMLElement>();

	const showPopover = ref(false);

	watch(importData, () => {
		if (importData.value) {
			const errs = props.history.loadEncodedString(importData.value);
			if(errs.length > 0)
				showAlert({ title: () => i18n.t("history-picker.import-error-title"), message: errs.join("\n"), variant: 'warning' });
			showPopover.value = true;
			importData.value = undefined;
		}
	}, { immediate: true });

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
			title: () => i18n.t("history-picker.clear-title"),
			message: () => i18n.t("history-picker.clear-message"),
			variant: "danger",
			okLabel: () => i18n.t("history-picker.clear-ok")
		})) {
			props.history.clear()
		}
	};
</script>

<template>
	<div v-if="historicStates.length > 1" class="dropdown bb-history" ref="dropdownRef">
		<button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
			<fa icon="clock"/><span class="d-none d-sm-inline">{{" "}}{{i18n.t("history-picker.history-alt")}}</span>
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
				>{{i18n.t("history-picker.clear")}}</a>
			</li>
		</ul>
	</div>

	<Popover :element="dropdownRef" v-model:show="showPopover" hide-on-outside-click>
		{{i18n.t("history-picker.shared-link")}}
	</Popover>
</template>

<style lang="scss">
	.bb-history {
		.popover {
			z-index: 900; /* Display below dialogs */
		}
	}
</style>