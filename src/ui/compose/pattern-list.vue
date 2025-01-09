<script setup lang="ts">
	import { copyTune, createPattern, createTune, getPatternFromState, removePattern, removeTune, renameTune } from "../../state/state";
	import PatternListFilter, { DEFAULT_FILTER, Filter, filterPatternList } from "../pattern-list-filter.vue";
	import defaultTunes from "../../defaultTunes";
	import PatternPlaceholder, { PatternPlaceholderItem } from "../pattern-placeholder.vue";
	import { useRefWithOverride } from "../../utils";
	import RenamePatternDialog from "./rename-pattern-dialog.vue";
	import PatternPlayerDialog from "../pattern-player/pattern-player-dialog.vue";
	import Collapse from "../utils/collapse.vue";
	import { computed, ref, watch } from "vue";
	import { injectStateRequired } from "../../services/state";
	import { showConfirm, showPrompt } from "../utils/alert";
	import vTooltip from "../utils/tooltip";
	import { getLocalizedDisplayName, useI18n } from "../../services/i18n";

	const props = defineProps<{
		expandTune?: string;
		editPattern?: string;
		isDraggingPattern?: boolean;
	}>();

	const emit = defineEmits<{
		"update:expandTune": [tuneName: string | undefined];
		"update:editPattern": [patternName: string | undefined];
		"update:isDraggingPattern": [isDraggingPattern: boolean];
	}>();
	const expandTune = useRefWithOverride(undefined, () => props.expandTune, (tuneName) => emit("update:expandTune", tuneName));
	const editPattern = useRefWithOverride(undefined, () => props.editPattern, (patternName) => emit("update:editPattern", patternName));
	const isDraggingPattern = useRefWithOverride(false, () => props.isDraggingPattern, (isDraggingPattern) => emit("update:isDraggingPattern", isDraggingPattern));

	const i18n = useI18n();

	type Opened = {
		[tuneName: string]: boolean
	}

	const state = injectStateRequired();

	const filter = ref<Filter>(DEFAULT_FILTER);
	const isOpened = ref<Opened>({});
	const showPatternEditor = ref<{ tuneName: string; patternName: string }>();
	const showRename = ref<{ tuneName: string; patternName: string }>();

	const isCustomPattern = (tuneName: string, patternName: string) => {
		return !defaultTunes.getPattern(tuneName, patternName);
	};

	const isCustomTune = (tuneName: string) => {
		return defaultTunes[tuneName] == null;
	};

	watch(expandTune, () => {
		if (expandTune.value) {
			isOpened.value[expandTune.value] = true;

			if(!filterPatternList(state.value, filter.value).includes(expandTune.value))
				filter.value = { text: "", cat: "all" };
		}
	}, { immediate: true });

	watch(filter, () => {
		const visibleTunes = filterPatternList(state.value, filter.value);
		for(const i in isOpened.value) {
			if(isOpened.value[i] && !visibleTunes.includes(i)) {
				toggleTune(i, false);
			}
		}
	}, { deep: true });

	const visibleTunes = computed(() => filterPatternList(state.value, filter.value).map((tuneName) => ({
		tuneName,
		isCustom: isCustomTune(tuneName),
		displayName: state.value.tunes[tuneName].displayName || tuneName,
		patterns: Object.keys(state.value.tunes[tuneName].patterns).map((patternName) => ({
			patternName,
			isCustom: isCustomPattern(tuneName, patternName)
		})),
		height: Object.keys(state.value.tunes[tuneName].patterns).length * 50 + 24
	})));

	const createPatternInTune = async (tuneName: string) => {
		const newPatternName = await showPrompt({
			title: () => i18n.t("pattern-list.create-pattern-title"),
			validate: (newPatternName) => {
				if(newPatternName.trim().length == 0)
					return i18n.t("pattern-list.create-pattern-empty-name-error");
				if(getPatternFromState(state.value, tuneName, newPatternName))
					return i18n.t("pattern-list.create-pattern-duplicate-name-error");
			},
			okLabel: () => i18n.t("pattern-list.create-pattern-ok")
		});

		if(newPatternName) {
			createPattern(state.value, tuneName, newPatternName);
			showPatternEditor.value = { tuneName, patternName: newPatternName };
		}
	};

	const copyPattern = async (tuneName: string, patternName: string) => {
		showRename.value = { tuneName, patternName };
	};

	const removePatternFromTune = async (tuneName: string, patternName: string) => {
		if (await showConfirm({
			title: () => i18n.t("pattern-list.remove-pattern-title"),
			message: () => i18n.t("pattern-list.remove-pattern-message", { tuneName, patternName }),
			variant: 'danger',
			okLabel: () => i18n.t("pattern-list.remove-pattern-ok")
		})) {
			removePattern(state.value, tuneName, patternName);
		}
	};

	const handleCreateTune = async () => {
		const newTuneName = await showPrompt({
			title: () => i18n.t("pattern-list.create-tune-title"),
			validate: (newTuneName) => {
				if(newTuneName.trim().length == 0)
					return i18n.t("pattern-list.create-tune-empty-name-error");
				if(state.value.tunes[newTuneName])
					return i18n.t("pattern-list.create-tune-duplicate-name-error");
			},
			okLabel: () => i18n.t("pattern-list.create-tune-ok")
		});

		if(newTuneName) {
			createTune(state.value, newTuneName);

			isOpened.value[newTuneName] = true;
			if (!filterPatternList(state.value, filter.value).includes(newTuneName))
				filter.value = { text: "", cat: "custom" };

			createPattern(state.value, newTuneName, "Tune", { loop: true });
			showPatternEditor.value = { tuneName: newTuneName, patternName: "Tune" };
		}
	};

	const handleRenameTune = async (tuneName: string) => {
		const newTuneName = await showPrompt({
			title: () => i18n.t("pattern-list.rename-tune-title"),
			initialValue: tuneName,
			validate: (newTuneName) => {
				if(newTuneName.trim().length == 0 || newTuneName == tuneName)
					return i18n.t("pattern-list.rename-tune-empty-name-error");
				if(state.value.tunes[newTuneName])
					return i18n.t("pattern-list.rename-tune-duplicate-name-error");
			},
			okLabel: () => i18n.t("pattern-list.rename-tune-ok")
		});

		if(newTuneName) {
			renameTune(state.value, tuneName, newTuneName);
		}
	};

	const handleCopyTune = async (tuneName: string) => {
		const newTuneName = await showPrompt({
			title: () => i18n.t("pattern-list.copy-tune-title"),
			initialValue: tuneName,
			validate: (newTuneName) => {
				if(newTuneName.trim().length == 0 || newTuneName == tuneName)
					return i18n.t("pattern-list.copy-tune-empty-name-error");
				if(state.value.tunes[newTuneName])
					return i18n.t("pattern-list.copy-tune-duplicate-name-error");
			},
			okLabel: () => i18n.t("pattern-list.copy-tune-ok")
		});

		if(newTuneName) {
			copyTune(state.value, tuneName, newTuneName);
		}
	};

	const handleRemoveTune = async (tuneName: string) => {
		if (await showConfirm({
			title: () => i18n.t("pattern-list.remove-tune-title"),
			message: () => i18n.t("pattern-list.remove-tune-message", { tuneName }),
			variant: 'danger',
			okLabel: () => i18n.t("pattern-list.remove-tune-ok")
		})) {
			removeTune(state.value, tuneName);
		}
	};

	const toggleTune = (tuneName: string, show = !isOpened.value[tuneName]) => {
		isOpened.value[tuneName] = show;

		if (show) {
			expandTune.value = tuneName;
		} else if (expandTune.value === tuneName) {
			expandTune.value = undefined;
		}
	};

	const handleEditorDialog = (tuneName: string, patternName: string, show: boolean) => {
		if (show) {
			expandTune.value = tuneName;
			editPattern.value = patternName;
		} else if (expandTune.value === tuneName && editPattern.value === patternName) {
			editPattern.value = undefined;
		}
	};
</script>

<template>
	<div class="bb-pattern-list">
		<PatternListFilter v-model="filter" />

		<hr />

		<div class="bb-pattern-list-tunes">
			<div v-for="tune in visibleTunes" :key="tune.tuneName" class="card">
				<div class="card-header">
					<div class="d-grid">
						<button type="button" class="btn btn-link" @click="toggleTune(tune.tuneName)">
							{{getLocalizedDisplayName(tune.displayName)}}
							<fa v-if="tune.isCustom" icon="star" v-tooltip="i18n.t('pattern-list.user-created-tune')"/>
							<fa icon="caret-down"/>
						</button>
					</div>
				</div>
				<Collapse :show="isOpened[tune.tuneName]" :height="tune.height">
					<div class="card-body">
						<PatternPlaceholder
							v-for="pattern in tune.patterns"
							:key="pattern.patternName"
							:tune-name="tune.tuneName"
							:pattern-name="pattern.patternName"
							:draggable="true"
							:showEditorDialog="expandTune === tune.tuneName && editPattern === pattern.patternName"
							@update:showEditorDialog="handleEditorDialog(tune.tuneName, pattern.patternName, $event)"
							@dragStart="isDraggingPattern = true"
							@dragEnd="isDraggingPattern = false"
						>
							<PatternPlaceholderItem><a href="javascript:" v-tooltip="pattern.isCustom ? i18n.t('pattern-list.copy-move-rename-break') : i18n.t('pattern-list.copy-break')" @click="copyPattern(tune.tuneName, pattern.patternName)" draggable="false"><fa icon="copy"/></a></PatternPlaceholderItem>
							<PatternPlaceholderItem v-if="pattern.isCustom"><a href="javascript:" v-tooltip="i18n.t('pattern-list.remove-break')" @click="removePatternFromTune(tune.tuneName, pattern.patternName)" draggable="false"><fa icon="trash"/></a></PatternPlaceholderItem>
							<slot :tuneName="tune.tuneName" :patternName="pattern.patternName"/>
						</PatternPlaceholder>
						<div class="tune-actions">
							<a href="javascript:" @click="createPatternInTune(tune.tuneName)" v-tooltip="i18n.t('pattern-list.create-break')" draggable="false"><fa icon="plus"/></a>
							<a v-if="tune.isCustom" href="javascript:" @click="handleRenameTune(tune.tuneName)" v-tooltip="i18n.t('pattern-list.rename-tune')" draggable="false"><fa icon="pen"/></a>
							<a href="javascript:" @click="handleCopyTune(tune.tuneName)" v-tooltip="i18n.t('pattern-list.copy-tune')" draggable="false"><fa icon="copy"/></a>
							<a v-if="tune.isCustom" href="javascript:" @click="handleRemoveTune(tune.tuneName)" v-tooltip="i18n.t('pattern-list.remove-tune')" draggable="false"><fa icon="trash"/></a>
						</div>
					</div>
				</Collapse>
			</div>
		</div>

		<div class="general-actions">
			<button type="button" class="btn btn-link" @click="handleCreateTune()"><fa icon="plus"/> {{i18n.t("pattern-list.create-tune")}}</button>
		</div>

		<PatternPlayerDialog
			v-if="showPatternEditor"
			:tune-name="showPatternEditor.tuneName"
			:pattern-name="showPatternEditor.patternName"
			@hidden="showPatternEditor = undefined"
		/>
		<RenamePatternDialog
			v-if="showRename"
			:tune-name="showRename.tuneName"
			:pattern-name="showRename.patternName"
			@hidden="showRename = undefined"
		/>
	</div>
</template>

<style lang="scss">
	.bb-pattern-list {

		display: flex;
		flex-direction: column;
		min-height: 0;

		.card-header, .card-body {
			padding: 0;
		}

		.card-header button {
			text-align: left;
			text-decoration: none;
			color: inherit;
			position: relative;

			.fa-caret-down {
				position: absolute;
				right: 10px;
				top: 50%;
				transform: translateY(-50%);
			}
		}

		.card {
			margin-bottom: 5px;
		}

		.bb-pattern-placeholder {
			margin: 2px;
		}

		.tune-actions {
			text-align: center;

			> * + * {
				margin-left: 0.25rem;
			}
		}

		hr {
			/* https://stackoverflow.com/a/34372979/242365 */
			margin-left: 0;
			margin-right: calc(30px - 1.2em);
		}

		.bb-pattern-list-filter {
			padding-right: calc(30px - 1.2em);
		}

		.bb-pattern-list-tunes {
			overflow-y: auto;
			padding-right: 15px;
		}

		.general-actions {
			padding-top: 10px;

			button {
				text-decoration: none;
			}
		}

	}
</style>