<script lang="ts">
	import { getPatternFromState } from "../../state/state";
	import { createBeatbox, songToBeatbox } from "../../services/player";
	import config, { Instrument } from "../../config";
	import { normalizePlaybackSettings } from "../../state/playbackSettings";
	import { deleteSongPart, getEffectiveSongLength, PatternReference, setSongPart } from "../../state/song";
	import { isEqual } from "lodash-es";
	import { DragType, getDragData, PatternResizeDragData, setDragData } from "../../services/draggable";
	import PatternPlaceholder, { PatternPlaceholderItem } from "../pattern-placeholder.vue";
	import { Pattern } from "../../state/pattern";
	import { injectStateRequired } from "../../services/state";
	import { computed, ref } from "vue";
	import MuteButton from "../playback-settings/mute-button.vue";
	import HeadphonesButton from "../playback-settings/headphones-button.vue";
	import SongPlayerToolbar from "./song-player-toolbar.vue";
	import vTooltip from "../utils/tooltip";
	import { useRefWithOverride } from "../../utils";
	import AbstractPlayer, { PositionData } from "../utils/abstract-player.vue";

	type DragOver = "trash" | { instr?: Instrument; idx: number };
</script>

<script setup lang="ts">
	const props = defineProps<{
		songIdx: number;
		isDraggingPattern?: boolean;
	}>();

	const emit = defineEmits<{
		(type: "update:songIdx", songIdx: number): void;
		(type: "update:isDraggingPattern", isDraggingPattern: boolean): void;
	}>();

	const state = injectStateRequired();

	const songIdx = computed({
		get: () => props.songIdx,
		set: (songIdx) => {
			emit("update:songIdx", songIdx);
		}
	});

	const playerRef = ref(createBeatbox(false));
	const resizing = ref<PatternResizeDragData>();
	const dragOver = ref<DragOver>();
	const dragOverCount = ref(0);

	const containerRef = ref<HTMLElement>();
	const abstractPlayerRef = ref<InstanceType<typeof AbstractPlayer>>();

	const isDraggingPattern = useRefWithOverride(false, () => props.isDraggingPattern, (isDraggingPattern) => emit("update:isDraggingPattern", isDraggingPattern));

	const song = computed(() => state.value.songs[songIdx.value]);

	const rawPattern = computed(() => songToBeatbox(song.value ?? {}, state.value, state.value.playbackSettings));

	const handlePosition = ({ beat }: PositionData) => {
		if(beat == null) {
			[...containerRef.value!.querySelectorAll(".beat.active")].forEach((el) => el.classList.remove("active"));
		} else {
			const beatIdx = Math.floor(Math.max(0, beat));

			const beatEl = containerRef.value!.querySelector<HTMLElement>(".beat-i-"+beatIdx);
			for (const el of containerRef.value!.querySelectorAll(".beat.active")) {
				if (el !== beatEl) {
					el.classList.remove("active");
				}
			}

			if (beatEl) {
				beatEl?.classList.add("active");
			}
		}
	};

	const getPositionMarkerLeft = ({ beat }: PositionData<false>) => {
		const beatWithoutUpbeat = Math.max(0, beat);
		const i = Math.floor(beatWithoutUpbeat);
		const beatEl = containerRef.value!.querySelector<HTMLElement>(`.beat-i-${i}`);
		return beatEl ? (beatEl.offsetLeft + (beatWithoutUpbeat - i) * beatEl.offsetWidth) : 0;
	};

	const length = computed(() => {
		let length = getEffectiveSongLength(song.value, state.value);
		if(isDraggingPattern.value)
			length++;
		if(dragOver.value && typeof dragOver.value === 'object')
			length = Math.max(length, dragOver.value.idx+2);
		length = Math.max(4, length);
		return length;
	});

	const getColSpan = (instrumentKey: Instrument, i: number) => {
		const patternRef = (song.value[i] && song.value[i][instrumentKey]);
		if(!patternRef)
			return 1;

		const pattern = getPatternFromState(state.value, patternRef);
		if(!pattern)
			return 1;

		let ret = 1;
		while(ret<(pattern.length/4)) {
			if(song.value[i+ret] && song.value[i+ret][instrumentKey])
				break;

			ret++;
		}
		return ret;
	};

	const getRowSpan = (instrumentKey: Instrument, i: number) => {
		if(!song.value[i] || !song.value[i][instrumentKey])
			return 1;

		const idx = config.instrumentKeys.indexOf(instrumentKey);
		const colspan = getColSpan(instrumentKey, i);
		let ret = 1;
		for(let j=idx+1; j<config.instrumentKeys.length; j++) {
			if(isEqual(song.value[i][instrumentKey], song.value[i][config.instrumentKeys[j]]) && colspan == getColSpan(config.instrumentKeys[j], i))
				ret++;
			else
				break;
		}
		return ret;
	};

	const shouldDisplay = (instrumentKey: Instrument, i: number) => {
		const idx = config.instrumentKeys.indexOf(instrumentKey);
		if (idx > 0 && getRowSpan(config.instrumentKeys[idx-1], i) >= 2)
			return false;

		for(let j=i-1; j>=0; j--) {
			if(song.value[j] && song.value[j][instrumentKey])
				return (j + getColSpan(instrumentKey, j) - 1 < i);
		}

		return true;
	};

	const removePatternFromSong = (instrumentKey: Instrument, idx: number) => {
		const span = getRowSpan(instrumentKey, idx);
		const instrIdx = config.instrumentKeys.indexOf(instrumentKey);
		for(let i=0; i<span; i++) {
			deleteSongPart(song.value, idx, config.instrumentKeys[instrIdx+i]);
		}
	};

	const toggleInstrument = (instrumentKey: Instrument, idx: number, tuneAndPattern: PatternReference) => {
		if(isEqual(song.value[idx][instrumentKey], tuneAndPattern))
			deleteSongPart(song.value, idx, instrumentKey);
		else
			setSongPart(song.value, idx, instrumentKey, tuneAndPattern);
	};

	const getPreviewPlaybackSettings = (instrumentKey: Instrument, idx: number) => {
		const ret = normalizePlaybackSettings(Object.assign({}, state.value.playbackSettings, {
			length: getColSpan(instrumentKey, idx)*4,
			loop: false
		}));

		const instrumentIdx = config.instrumentKeys.indexOf(instrumentKey);
		const rowSpan = getRowSpan(instrumentKey, idx);
		for(let i=0; i<config.instrumentKeys.length; i++) {
			ret.mute[config.instrumentKeys[i]] = (i < instrumentIdx || i >= instrumentIdx+rowSpan);
		}

		return ret;
	};

	const setPosition = (idx: number, $event: MouseEvent) => {
		const beatRect = ($event.target as Element).closest(".beat")!.getBoundingClientRect();
		const add = ($event.clientX - beatRect.left) / beatRect.width;
		abstractPlayerRef.value!.setBeat(idx + add);
	};

	const handleResizeDragStart = (event: DragEvent, instr: Instrument, idx: number) => {
		const data: PatternResizeDragData = {
			type: DragType.PATTERN_RESIZE,
			instr,
			idx
		};

		event.dataTransfer!.effectAllowed = "move";
		setDragData(event, data);

		setTimeout(() => {
			// Delay due to https://stackoverflow.com/a/19663227/242365
			resizing.value = data;
		}, 0);
	};

	const handleResizeDragEnd = (event: DragEvent) => {
		resizing.value = undefined;
	};

	const handleDragEnter = (event: DragEvent, thisDragOver: DragOver) => {
		event.preventDefault();
		const dataTransfer = event.dataTransfer as DataTransfer;
		if(["move", "linkMove"].includes(dataTransfer.effectAllowed))
			dataTransfer.dropEffect = "move";
		else
			dataTransfer.dropEffect = "copy";

		if(isEqual(thisDragOver, dragOver.value))
			dragOverCount.value++;
		else
			dragOverCount.value = 1;
		dragOver.value = thisDragOver;
	};

	const handleDragLeave = (event: DragEvent, thisDragOver: DragOver) => {
		if(isEqual(thisDragOver, dragOver.value) && --dragOverCount.value <= 0)
			dragOver.value = undefined;
	};

	const handleDrop = (event: DragEvent) => {
		const data = getDragData(event);
		if(data && data.type == DragType.PLACEHOLDER && dragOver.value instanceof Object) {
			if(data.data && data.data.instr != null && data.data.idx != null) {
				removePatternFromSong(data.data.instr, data.data.idx);
			}

			dropPattern(data.pattern, dragOver.value.instr, dragOver.value.idx);
			event.preventDefault();
		} else if(data && data.type == DragType.PATTERN_RESIZE) {
			resizePattern(data);
			event.preventDefault();
		}

		dragOver.value = undefined;
		dragOverCount.value = 0;
	};

	const dropPattern = (pattern: PatternReference, instr: Instrument | undefined, idx: number) => {
		if(instr)
			setSongPart(song.value, idx, instr, pattern);
		else {
			for(const instr of config.instrumentKeys) {
				setSongPart(song.value, idx, instr, pattern);
			}
		}
	};

	const isDragOver = (thisDragOver: DragOver) => {
		if(resizing.value) {
			return typeof thisDragOver === 'object' && thisDragOver.instr
				&& typeof dragOver.value === 'object' && dragOver.value.instr
				&& thisDragOver.idx >= resizing.value.idx && thisDragOver.idx <= dragOver.value.idx
				&& config.instrumentKeys.indexOf(thisDragOver.instr) >= Math.min(config.instrumentKeys.indexOf(resizing.value.instr), config.instrumentKeys.indexOf(dragOver.value.instr))
				&& config.instrumentKeys.indexOf(thisDragOver.instr) <= Math.max(config.instrumentKeys.indexOf(resizing.value.instr), config.instrumentKeys.indexOf(dragOver.value.instr));
		}

		if(isEqual(thisDragOver, dragOver.value))
			return true;

		if(typeof thisDragOver === 'object' && typeof dragOver.value === 'object' && dragOver.value.instr == null && dragOver.value.idx == thisDragOver.idx)
			return true;

		return false;
	};

	const getDragOverClass = (dragOver: DragOver) => {
		return isDragOver(dragOver) ? "drag-over" : "";
	};

	const resizePattern = ({ idx, instr }: PatternResizeDragData) => {
		const tuneAndPattern = song.value[idx][instr];

		if(!tuneAndPattern || !(typeof dragOver.value === 'object') || !dragOver.value.instr)
			return;

		const span = getRowSpan(instr, idx);
		const instrIdx = config.instrumentKeys.indexOf(instr);
		for(let i=0; i<span; i++) {
			deleteSongPart(song.value, idx, config.instrumentKeys[instrIdx+i]);
		}

		const patternLength = Math.ceil((getPatternFromState(state.value, tuneAndPattern) as Pattern).length / 4);
		for(const part of getAffectedResizePatternRange(instr, idx, dragOver.value.instr as Instrument, dragOver.value.idx, patternLength)) {
			dropPattern(tuneAndPattern, part[0], part[1]);
		}
	};

	const getAffectedResizePatternRange = (instrumentKey: Instrument, idx: number, toInstrumentKey: Instrument, toIdx: number, patternLength: number) => {
		const instrumentIdx = config.instrumentKeys.indexOf(instrumentKey);
		const toInstrumentIdx = config.instrumentKeys.indexOf(toInstrumentKey);
		toIdx = Math.max(idx, toIdx);

		const ret: Array<[ Instrument, number ]> = [ ];

		for(let i=idx; i<=toIdx; i += (patternLength || 1)) {
			for(let j=Math.min(instrumentIdx, toInstrumentIdx); j<=Math.max(instrumentIdx, toInstrumentIdx); j++) {
				ret.push([ config.instrumentKeys[j], i ]);
			}
		}

		return ret;
	};
</script>

<template>
	<div class="bb-song-player" :class="{ dragging: isDraggingPattern, resizing }" ref="containerRef">
		<SongPlayerToolbar :player="playerRef" v-model:songIdx="songIdx">
			<template v-slot:after-actions>
				<div class="trash-drop">
					<div
						:class="getDragOverClass('trash')"
						@dragenter="handleDragEnter($event, 'trash')"
						@dragover="$event.preventDefault()"
						@dragleave="handleDragLeave($event, 'trash')"
						@drop="handleDrop($event)"
					>
						<fa icon="trash"/>
					</div>
				</div>
			</template>

			<template v-slot:right>
				<slot name="toolbar-right"/>
			</template>
		</SongPlayerToolbar>

		<div class="song-player-container">
			<div class="bb-col instruments">
				<div class="timeline"></div>
				<div class="field" v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
					{{config.instruments[instrumentKey].name}}
				</div>
				<div class="field all-drop">All</div>
			</div><div class="bb-col instrument-actions">
				<div class="timeline">
					<MuteButton instrument="all" v-model:playbackSettings="state.playbackSettings"/>
				</div>
				<div class="field" v-for="instrumentKey of config.instrumentKeys" :key="instrumentKey">
					<ul class="icon-list">
						<HeadphonesButton :instrument="instrumentKey" v-model:playbackSettings="state.playbackSettings" groupSurdos />
						&nbsp;
						<MuteButton :instrument="instrumentKey" v-model:playbackSettings="state.playbackSettings" />
					</ul>
				</div>
				<div class="field all-drop"></div>
			</div><div class="song-container"><div class="bb-col song" v-for="i in length" :key="i">
				<div class="timeline">
					<span v-for="i2 in 4" :key="i2" class="beat" :class="'beat-i-'+((i-1)*4+i2-1)" @click="setPosition((i-1)*4+i2-1, $event)">{{(i-1)*4+i2}}</span>
				</div>
				<div
					:class="`field song-field-${instrumentKey}-${i-1} ${getDragOverClass({ instr: instrumentKey, idx: i-1 })}`"
					v-for="instrumentKey of config.instrumentKeys"
					:key="instrumentKey"
					@dragenter="handleDragEnter($event, { instr: instrumentKey, idx: i-1 })"
					@dragover="$event.preventDefault()"
					@dragleave="handleDragLeave($event, { instr: instrumentKey, idx: i-1 })"
					@drop="handleDrop($event)"
				>
					<div :class="`pattern-container colspan-${getColSpan(instrumentKey, i-1)} rowspan-${getRowSpan(instrumentKey, i-1)}`" v-if="song[i-1] && song[i-1][instrumentKey] && shouldDisplay(instrumentKey, i-1)">
						<PatternPlaceholder
							:tune-name="song[i-1][instrumentKey]![0]"
							:pattern-name="song[i-1][instrumentKey]![1]"
							:draggable="{ instr: instrumentKey, idx: i-1 }"
							dragEffect="move"
							:settings="getPreviewPlaybackSettings(instrumentKey, i-1)"
							@dragStart="isDraggingPattern = true"
							@dragEnd="isDraggingPattern = false"
						>
							<PatternPlaceholderItem>
								<div class="dropdown">
									<a href="javascript" data-bs-toggle="dropdown">
										<fa icon="hand-point-right" v-tooltip="'Pick instruments'"/>
									</a>
									<ul class="dropdown-menu">
										<li v-for="instrumentKey2 in config.instrumentKeys" :key="instrumentKey2">
											<a
												class="dropdown-item"
												href="javascript:"
												@click="toggleInstrument(instrumentKey2, i-1, song[i-1][instrumentKey]!)"
												draggable="false"
											><fa icon="check" :style="{visibility: isEqual(song[i-1][instrumentKey2], song[i-1][instrumentKey]) ? 'visible' : 'hidden'}"></fa> {{config.instruments[instrumentKey2].name}}</a>
										</li>
									</ul>
								</div>
							</PatternPlaceholderItem>
							<PatternPlaceholderItem>
								<a href="javascript:" @click="removePatternFromSong(instrumentKey, i-1)" v-tooltip="'Remove'" draggable="false"><fa icon="trash" /></a>
							</PatternPlaceholderItem>
						</PatternPlaceholder>
						<span class="placeholder-drag-handle" draggable="true" @dragstart="handleResizeDragStart($event, instrumentKey, i-1)" @dragend="handleResizeDragEnd($event)"><span class="caret-se"></span></span>
					</div>
				</div>
				<div
					class="field all-drop"
					:class="getDragOverClass({ idx: i-1 })"
					@dragenter="handleDragEnter($event, { idx: i-1 })"
					@dragover="$event.preventDefault()"
					@dragleave="handleDragLeave($event, { idx: i-1 })"
					@drop="handleDrop($event)"
				>
					(All)
				</div>
			</div></div>

			<AbstractPlayer
				:player="playerRef"
				:rawPattern="rawPattern"
				:playbackSettings="state.playbackSettings"
				:getLeft="getPositionMarkerLeft"
				@position="handlePosition"
				ref="abstractPlayerRef"
			/>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-song-player {
		height: 100%;
		display: flex;
		flex-direction: column;

		.trash-drop {
			height: 0;
			margin: 0;

			> * {
				font-size: 35px;
				line-height: 35px;
				width: 65px;
				height: 65px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				position: absolute;
				transform: translateY(-50%);
				margin-left: 25px;
				padding: 15px;
				border-radius: 60px;
				background: #fff;
				box-shadow: 0 0 10px #000;
				z-index: 100;
			}
		}

		.trash-drop, .all-drop {
			opacity: 0;
			pointer-events: none;
			transition: opacity 0.7s;
		}

		.drag-over {
			background: #def;
		}

		.pattern-container {
			transition: opacity 0.7s;
		}

		&.dragging {
			.trash-drop, .all-drop {
				opacity: 1;
				pointer-events: auto;
			}
		}

		&.dragging .pattern-container, &.resizing .pattern-container {
			pointer-events: none;
			opacity: 0.7;

			.bb-pattern-placeholder.dragging {
				height: auto !important;
			}

			.placeholder-drag-handle {
				visibility: hidden;
			}
		}

		.song-player-container {
			flex-grow: 1;
			position: relative;
			white-space: nowrap;
			margin-top: 1em;
			overflow: auto;
			padding: 0 1.2em 1.2em 1.2em;

			.song-container {
				display: inline-block;
				vertical-align: top;
			}

			.bb-col {
				display: inline-block;
				vertical-align: top;

				&.song {
					width: 10em;

					.field {
						padding: .2em .5em;

						.pattern-container {
							position: relative;
						}

						@for $i from 1 through 20 {
							.pattern-container.colspan-#{$i} {
								width: 10em * $i - 1em;
							}

							.pattern-container.rowspan-#{$i} {
								height: 3.4em * $i - .4em;
							}
						}

						.bb-pattern-placeholder {
							height: 100%;
						}

						.placeholder-drag-handle {
							position: absolute;
							bottom: 0;
							right: 0;
							cursor: se-resize;
							display: block;

							.caret-se {
								display: block;
								width: 0;
								height: 0;
								color: #666;
								border-bottom: 8px solid;
								border-right: 8px solid;
								border-top: 8px solid transparent;
								border-left: 8px solid transparent;
							}
						}
					}
				}

				&.instruments .field {
					font-weight: bold;
					padding-right: 1ex;
				}

				&.instrument-actions > * {
					padding-right: 5px;
				}

				&.instrument-actions,&.song {
					border-right: 1px solid #888;
				}

				&.instruments .field,&.instrument-actions .field {
					line-height: 3.4em;
					vertical-align: middle;
				}

				&.instrument-actions {
					text-align: right;
				}

				.field {
					height: 3.4em;
				}

				.timeline {
					height: 2em;
					border-bottom: 1px solid #888;
				}

				.beat {
					width: 25%;
					cursor: pointer;
					display: inline-block;
					padding: 0 .5ex;
					border-radius: 10px;
					transition: background-color 1s, color 1s;
				}

				.all-drop {
					border-top: 1px solid #888;
				}

				&.song .all-drop {
					font-style: italic;
					text-align: center;
					line-height: 3.4em;
					vertical-align: center;
					border-bottom: 1px solid #888;
				}
			}
		}

		.song-player-container .bb-col .beat.active {
			background-color: #3a94a5;
			color: #fff;
			transition: none;
		}

		.actions .dropdown-toggle {
			padding: 0;
		}
	}
</style>