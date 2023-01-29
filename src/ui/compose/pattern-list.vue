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

	const props = defineProps<{
		expandTune?: string;
		editPattern?: string;
	}>();

	const emit = defineEmits<{
		(type: "update:expandTune", tuneName: string | undefined): void;
		(type: "update:editPattern", patternName: string | undefined): void;
	}>();
	const expandTune = useRefWithOverride(undefined, () => props.expandTune, (tuneName) => emit("update:expandTune", tuneName));
	const editPattern = useRefWithOverride(undefined, () => props.editPattern, (patternName) => emit("update:editPattern", patternName));

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
			title: "New break",
			validate: (newPatternName) => {
				if(newPatternName.trim().length == 0)
					return "Please enter a name for the new break.";
				if(getPatternFromState(state.value, tuneName, newPatternName))
					return "This name is already taken. Please enter a different one.";
			}
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
		if (await showConfirm({ title: "Remove break", message: `Do you really want to remove ${patternName} (${tuneName})?`, variant: 'danger' })) {
			removePattern(state.value, tuneName, patternName);
		}
	};

	const handleCreateTune = async () => {
		const newTuneName = await showPrompt({
			title: "Create tune",
			validate: (newTuneName) => {
				if(newTuneName.trim().length == 0)
					return "Please enter a name for the new tune.";
				if(state.value.tunes[newTuneName])
					return "This name is already taken. Please enter a different one.";
			}
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
			title: "Rename tune",
			initialValue: tuneName,
			validate: (newTuneName) => {
				if(newTuneName.trim().length == 0 || newTuneName == tuneName)
					return "Please enter a new name for the tune.";
				if(state.value.tunes[newTuneName])
					return "This name is already taken. Please enter a different one.";
			}
		});

		if(newTuneName) {
			renameTune(state.value, tuneName, newTuneName);
		}
	};

	const handleCopyTune = async (tuneName: string) => {
		const newTuneName = await showPrompt({
			title: "Copy tune",
			initialValue: tuneName,
			validate: (newTuneName) => {
				if(newTuneName.trim().length == 0 || newTuneName == tuneName)
					return "Please enter a new name for the tune.";
				if(state.value.tunes[newTuneName])
					return "This name is already taken. Please enter a different one.";
			}
		});

		if(newTuneName) {
			copyTune(state.value, tuneName, newTuneName);
		}
	};

	const handleRemoveTune = async (tuneName: string) => {
		if (await showConfirm({ title: "Remove tune", message: `Do you really want to remove the tune ${tuneName}?`, variant: 'danger' })) {
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
							{{tune.displayName}}
							<fa v-if="tune.isCustom" icon="star" v-tooltip="'User-created tune'"/>
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
						>
							<PatternPlaceholderItem><a href="javascript:" v-tooltip="`Copy${pattern.isCustom ? '/Move/Rename' : ''} break`" @click="copyPattern(tune.tuneName, pattern.patternName)" draggable="false"><fa icon="copy"/></a></PatternPlaceholderItem>
							<PatternPlaceholderItem v-if="pattern.isCustom"><a href="javascript:" v-tooltip="'Remove'" @click="removePatternFromTune(tune.tuneName, pattern.patternName)" draggable="false"><fa icon="trash"/></a></PatternPlaceholderItem>
							<slot :tuneName="tune.tuneName" :patternName="pattern.patternName"/>
						</PatternPlaceholder>
						<div class="tune-actions">
							<a href="javascript:" @click="createPatternInTune(tune.tuneName)" v-tooltip="'New break'" draggable="false"><fa icon="plus"/></a>
							<a v-if="tune.isCustom" href="javascript:" @click="handleRenameTune(tune.tuneName)" v-tooltip="'Rename tune'" draggable="false"><fa icon="pen"/></a>
							<a href="javascript:" @click="handleCopyTune(tune.tuneName)" v-tooltip="'Copy tune'" draggable="false"><fa icon="copy"/></a>
							<a v-if="tune.isCustom" href="javascript:" @click="handleRemoveTune(tune.tuneName)" v-tooltip="'Remove tune'" draggable="false"><fa icon="trash"/></a>
						</div>
					</div>
				</Collapse>
			</div>
		</div>

		<div class="general-actions">
			<a href="javascript:" @click="handleCreateTune()" draggable="false"><fa icon="plus"/> New tune</a>
		</div>

		<PatternPlayerDialog v-if="showPatternEditor" show :tune-name="showPatternEditor.tuneName" :pattern-name="showPatternEditor.patternName" @update:show="showPatternEditor = $event ? showPatternEditor : undefined"/>
		<RenamePatternDialog v-if="showRename" show :tune-name="showRename.tuneName" :pattern-name="showRename.patternName" @update:show="showRename = $event ? showRename : undefined"/>
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
		}

	}
</style>