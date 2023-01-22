<script lang="ts">
	import Beatbox from "beatbox.js";
	import { createPattern, getPatternFromState } from "../state/state";
	import { BeatboxReference, createBeatbox, getPlayerById, patternToBeatbox, stopAllPlayers } from "../services/player";
	import { normalizePlaybackSettings, PlaybackSettings } from "../state/playbackSettings";
	import config from "../config";
	import defaultTunes from "../defaultTunes";
	import { patternEquals } from "../state/pattern";
	import { injectEventBusRequired, useEventBusListener } from "../services/events";
	import { DragType, PatternDragData, setDragData } from "../services/draggable";
	import PatternPlayerDialog from "./pattern-player/pattern-player-dialog.vue";
	import { clone } from "../utils";
	import { computed, defineComponent, h, ref, watch } from "vue";
	import { injectStateRequired } from "../services/state";
	import { showConfirm } from "./utils/alert";
	import vTooltip from "./utils/tooltip";

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
		draggable?: any,
		dragEffect?: DataTransfer['dropEffect']
	}>(), {
		readonly: false,
		dragEffect: "copy"
	});

	const playerRef = ref<BeatboxReference>();
	const player = computed(() => playerRef.value && getPlayerById(playerRef.value.id));

	const showEditorDialog = ref(false);
	const dragging = ref(false);

	const containerRef = ref<HTMLElement>();
	const positionMarkerRef = ref<HTMLElement>();

	useEventBusListener("edit-pattern", (data) => {
		if(!data.handled && data.pattern[0] == props.tuneName && data.pattern[1] == props.patternName && data.readonly == props.readonly) {
			data.handled = true;
			editPattern();
		}
	});

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName));

	const fallbackPlaybackSettings = ref<PlaybackSettings>(null as any as PlaybackSettings);
	watch(() => state.value.playbackSettings, () => {
		fallbackPlaybackSettings.value = normalizePlaybackSettings(Object.assign(clone(state.value.playbackSettings), pattern.value && {
			speed: pattern.value.speed,
			loop: pattern.value.loop
		}));
	}, { deep: true, immediate: true });

	const playbackSettings = computed(() => props.settings || fallbackPlaybackSettings.value);

	const hasLocalChanges = computed(() => {
		const original = defaultTunes.getPattern(props.tuneName, props.patternName);
		return original && pattern.value && !patternEquals(original, pattern.value);
	});

	const isCustomPattern = computed(() => !defaultTunes.getPattern(props.tuneName, props.patternName));

	const eventBus = injectEventBusRequired();

	watch(() => playbackSettings.value, () => {
		updatePlayer();
	}, { deep: true });

	watch(() => pattern.value, () => {
		updatePlayer();
	}, { deep: true });

	const editPattern = () => {
		showEditorDialog.value = true;
	};

	const getOrCreatePlayer = (): Beatbox => {
		if (!playerRef.value) {
			playerRef.value = createBeatbox(false);
			player.value!.on("beat", (beat: number) => {
				if (containerRef.value && positionMarkerRef.value) {
					positionMarkerRef.value.style.left = `${(beat / player.value!._pattern.length) * containerRef.value.offsetWidth}px`;
				}
			});
			updatePlayer();
		}
		return player.value!;
	};

	const updatePlayer = () => {
		if(!player.value)
			return;

		if(!pattern.value)
			return;

		const settings = {
			...playbackSettings.value,
			loop: pattern.value.loop || playbackSettings.value.loop
		};

		const rawPattern = patternToBeatbox(pattern.value, settings);

		player.value.setPattern(settings.length ? rawPattern.slice(0, settings.length * config.playTime + pattern.value.upbeat) : rawPattern);
		player.value.setUpbeat(rawPattern.upbeat);
		player.value.setBeatLength(60000 / settings.speed / config.playTime);
		player.value.setRepeat(settings.loop);
	};

	const playPattern = () => {
		const p = getOrCreatePlayer();

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
		if(await showConfirm({ title: 'Revert modifications', message: `Are you sure that you want to revert your modifications to ${props.patternName} (${props.tuneName})?` })) {
			createPattern(state.value, props.tuneName, props.patternName, defaultTunes.getPattern(props.tuneName, props.patternName) || undefined);
		}
	};

	const handleDragStart = (event: DragEvent) => {
		const dragData: PatternDragData = {
			type: DragType.PLACEHOLDER,
			pattern: [ props.tuneName, props.patternName ],
			data: props.draggable
		};
		(event.dataTransfer as DataTransfer).effectAllowed = props.dragEffect;
		setDragData(event, dragData);
		setTimeout(() => {
			dragging.value = true;
		}, 0);
		eventBus.emit("pattern-placeholder-drag-start");
	};

	const handleDragEnd = (event: DragEvent) => {
		eventBus.emit("pattern-placeholder-drag-end");
		setTimeout(() => {
			dragging.value = false;
		}, 0);
	};
</script>

<template>
	<div class="bb-pattern-placeholder" :class="[{ dragging }, `drag-effect-${dragEffect}`]" :draggable="draggable ? 'true' : 'false'" @dragstart="handleDragStart($event)" @dragend="handleDragEnd($event)" ref="containerRef">
		<div class="card pattern-button">
			<span class="tune-name">{{state.tunes[tuneName].displayName || tuneName}}</span>
			<br>
			<span class="pattern-name">
				{{state.tunes[tuneName].patterns[patternName].displayName || patternName}}
				<fa v-if="isCustomPattern" icon="star" v-tooltip="'User-created break'"/>
			</span>
		</div>
		<ul class="actions icon-list">
			<li><a href="javascript:" v-tooltip="'Listen'" @click="playPattern()" draggable="false"><fa :icon="playerRef && playerRef.playing ? 'stop' : 'play-circle'"></fa></a></li>
			<li><a href="javascript:" v-tooltip="readonly ? 'Show notes' : 'Edit notes'" @click="editPattern()" draggable="false"><fa icon="pen"/></a></li>
			<li v-if="hasLocalChanges"><a href="javascript:" v-tooltip="'Revert modifications'" @click="restore()" draggable="false"><fa icon="eraser"/></a></li>
			<slot :getPlayer="() => { getOrCreatePlayer(); return playerRef!; }"/>
		</ul>
		<div class="position-marker" v-show="playerRef && playerRef.playing" ref="positionMarkerRef"></div>
		<PatternPlayerDialog v-if="showEditorDialog" v-model:show="showEditorDialog" :readonly="readonly" :tune-name="tuneName" :pattern-name="patternName" :player-ref="playerRef"/>
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