<script lang="ts">
	import { createPattern, getPatternFromState } from "../state/state";
	import { patternToBeatbox, RawPatternWithUpbeat, stopAllPlayers } from "../services/player";
	import { normalizePlaybackSettings, PlaybackSettings } from "../state/playbackSettings";
	import config from "../config";
	import defaultTunes from "../defaultTunes";
	import { patternEquals } from "../state/pattern";
	import { DragType, PatternDragData, setDragData } from "../services/draggable";
	import PatternPlayerDialog from "./pattern-player/pattern-player-dialog.vue";
	import { clone, useRefWithOverride } from "../utils";
	import { computed, defineComponent, h, onBeforeUnmount, ref } from "vue";
	import { injectStateRequired } from "../services/state";
	import { showConfirm } from "./utils/alert";
	import vTooltip from "./utils/tooltip";
	import AbstractPlayer, { PositionData } from "./utils/abstract-player.vue";
	import { useI18n } from "../services/i18n";

	export const PatternPlaceholderItem = defineComponent({
		setup(props, { slots }) {
			return () => h('li', slots.default?.());
		}
	});
</script>

<script setup lang="ts">
	const state = injectStateRequired();

	const props = withDefaults(defineProps<{
		tuneName: string;
		patternName: string;
		readonly?: boolean;
		settings?: PlaybackSettings;
		draggable?: any;
		dragEffect?: DataTransfer['dropEffect'];
		showEditorDialog?: boolean | undefined;
	}>(), {
		readonly: false,
		dragEffect: "copy",
		showEditorDialog: undefined
	});

	const emit = defineEmits<{
		"update:showEditorDialog": [show: boolean];
		"dragStart": [];
		"dragEnd": [];
	}>();

	const i18n = useI18n();

	const showEditorDialog = useRefWithOverride(false, () => props.showEditorDialog, (show) => emit("update:showEditorDialog", show));
	const dragging = ref(false);

	const containerRef = ref<HTMLElement>();
	const abstractPlayerRef = ref<InstanceType<typeof AbstractPlayer>>();

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName));

	const fallbackPlaybackSettings = computed(() => normalizePlaybackSettings({
		...clone(state.value.playbackSettings),
		...(pattern.value ? {
			speed: pattern.value.speed,
			loop: pattern.value.loop
		} : {})
	}));

	const playbackSettings = computed(() => props.settings || fallbackPlaybackSettings.value);

	const hasLocalChanges = computed(() => {
		const original = defaultTunes.getPattern(props.tuneName, props.patternName);
		return original && pattern.value && !patternEquals(original, pattern.value);
	});

	const isCustomPattern = computed(() => !defaultTunes.getPattern(props.tuneName, props.patternName));

	const editPattern = () => {
		showEditorDialog.value = true;
	};

	const playerPlaybackSettings = computed(() => ({
		...playbackSettings.value,
		loop: pattern.value?.loop || playbackSettings.value.loop
	}));

	const rawPattern = computed<RawPatternWithUpbeat>(() => {
		if (!pattern.value) {
			return Object.assign([], { upbeat: 0 });
		}

		const result = patternToBeatbox(pattern.value ?? {}, playerPlaybackSettings.value);
		if (playerPlaybackSettings.value.length) {
			return Object.assign(result.slice(0, playerPlaybackSettings.value.length * config.playTime + pattern.value.upbeat), { upbeat: result.upbeat });
		} else {
			return result;
		}
	});

	const getPositionMarkerLeft = ({ position, player }: PositionData<false>) => {
		return (position / player._pattern.length) * containerRef.value!.offsetWidth;
	};

	const playPattern = () => {
		const p = abstractPlayerRef.value!.getOrCreatePlayer();

		if(!p.playing) {
			stopAllPlayers();
			p.setPosition(0);
			p.play();
		} else {
			p.stop();
			p.setPosition(0);
		}
	};

	const restore = async () => {
		if(await showConfirm({
			title: () => i18n.t("pattern-placeholder.restore-title"),
			message: () => i18n.t("pattern-placeholder.restore-message", { tuneName: props.tuneName, patternName: props.patternName }),
			variant: "warning",
			okLabel: () => i18n.t("pattern-placeholder.restore-ok")
		})) {
			createPattern(state.value, props.tuneName, props.patternName, defaultTunes.getPattern(props.tuneName, props.patternName) || undefined);
		}
	};

	const handleDragStart = (event: DragEvent) => {
		const dragData: PatternDragData = {
			type: DragType.PLACEHOLDER,
			pattern: [ props.tuneName, props.patternName ],
			data: props.draggable
		};
		event.dataTransfer!.effectAllowed = props.dragEffect;
		setDragData(event, dragData);
		setTimeout(() => {
			// Delay due to https://stackoverflow.com/a/19663227/242365
			dragging.value = true;
			emit("dragStart");
		}, 0);
	};

	const handleDragEnd = (event: DragEvent) => {
		emit("dragEnd");
		dragging.value = false;
	};

	onBeforeUnmount(() => {
		if (dragging.value) {
			emit("dragEnd");
		}
	});
</script>

<template>
	<div class="bb-pattern-placeholder" :class="[{ dragging }, `drag-effect-${dragEffect}`]" :draggable="draggable ? 'true' : 'false'" @dragstart="handleDragStart($event)" @dragend="handleDragEnd($event)" ref="containerRef">
		<div class="card pattern-button">
			<span class="tune-name">{{state.tunes[tuneName].displayName || tuneName}}</span>
			<br>
			<span class="pattern-name">
				{{state.tunes[tuneName].patterns[patternName].displayName || patternName}}
				<fa v-if="isCustomPattern" icon="star" v-tooltip="i18n.t('pattern-placeholder.user-created-tooltip')"/>
			</span>
		</div>
		<ul class="actions icon-list">
			<li><a href="javascript:" v-tooltip="i18n.t('pattern-placeholder.listen-tooltip')" @click="playPattern()" draggable="false"><fa :icon="abstractPlayerRef?.playerRef?.playing ? 'stop' : 'play-circle'"></fa></a></li>
			<li><a href="javascript:" v-tooltip="readonly ? i18n.t('pattern-placeholder.show-notes-tooltip') : i18n.t('pattern-placeholder.edit-notes-tooltip')" @click="editPattern()" draggable="false"><fa icon="pen"/></a></li>
			<li v-if="hasLocalChanges"><a href="javascript:" v-tooltip="i18n.t('pattern-placeholder.restore-tooltip')" @click="restore()" draggable="false"><fa icon="eraser"/></a></li>
			<slot :getPlayer="() => { abstractPlayerRef!.getOrCreatePlayer(); return abstractPlayerRef!.playerRef!; }"/>
		</ul>

		<AbstractPlayer
			:rawPattern="rawPattern"
			:playbackSettings="playerPlaybackSettings"
			:getLeft="getPositionMarkerLeft"
			ref="abstractPlayerRef"
		/>

		<PatternPlayerDialog
			v-if="showEditorDialog"
			@hidden="showEditorDialog = false"
			:readonly="readonly"
			:tune-name="tuneName"
			:pattern-name="patternName"
			:player-ref="abstractPlayerRef?.playerRef"
		/>
	</div>
</template>

<style lang="scss">
	.bb-pattern-placeholder.bb-pattern-placeholder.bb-pattern-placeholder.bb-pattern-placeholder {

		height: 3em;
		position: relative;

		&[draggable=true] {
			cursor: move;
		}

		&.dragging.drag-effect-move {
			visibility: hidden;
		}

		.card-body {
			padding: 0;
		}

		.pattern-button {
			height: 100%;
			box-sizing: border-box;
			display: block;
			text-align: left;
			padding: 0 12px;
			overflow: hidden;

			.tune-name {
				font-weight: bold;
			}
		}

		.actions {
			position: absolute;
			padding: 3px 5px;
			top: 2px;
			right: 2px;
			border-radius: 5px;
			background: rgba(255, 255, 255, 0.5);
			opacity: 0.5;
			transition: opacity .3s, background-color .3s;

			&:hover {
				opacity: 1;
				background-color: #fff;
			}
		}

		.position-marker {
			position: absolute;
			top: 0;
			height: 100%;
			border-left: 1px solid #000;
			transition: left 0.1s linear;
			pointer-events: none;
		}

	}

	#bb-pattern-placeholder-drag-clone {
		opacity: .5;
	}
</style>