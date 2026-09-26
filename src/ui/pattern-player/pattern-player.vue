<script lang="ts">
	/**
	 * Renders the notes of a pattern as a table, with a toolbar that allows to play the notes and various other actions,
	 * and the notes being editable (unless opened in read-only mode).
	 */
	export default {};
</script>

<script setup lang="ts">
	import config, { Instrument } from "../../config";
	import { BeatboxReference, createBeatbox, patternToBeatbox } from "../../services/player";
	import { normalizePattern, patternEquals, updateStroke } from "../../state/pattern";
	import { normalizePlaybackSettings, PlaybackSettings, updatePlaybackSettings } from "../../state/playbackSettings";
	import { createPattern, getPatternFromState } from "../../state/state";
	import { clone } from "../../utils";
	import defaultTunes from "../../defaultTunes";
	import { isEqual } from "lodash-es";
	import StrokeDropdown from "./stroke-dropdown.vue";
	import StrokeCell from "./stroke-cell.vue";
	import { injectStateRequired } from "../../services/state";
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
	import { showConfirm } from "../utils/alert";
	import { CustomPopover } from "../utils/popover.vue";
	import PatternPlayerToolbar from "./pattern-player-toolbar.vue";
	import MuteButton from "../playback-settings/mute-button.vue";
	import HeadphonesButton from "../playback-settings/headphones-button.vue";
	import AbstractPlayer, { PositionData } from "../utils/abstract-player.vue";
	import { useI18n } from "../../services/i18n";
	import type { Verdict } from "../../services/practiceScorer";

	type StrokeDropdownInfo = {
		instr: Instrument,
		i: number,
		sequence?: string
	};

	const state = injectStateRequired();

	// Stable empty-pattern fallback (see the `pattern` computed below). Hoisted out of
	// the computed so the fallback path returns a consistent object identity instead of
	// allocating a new pattern per recompute. normalizePattern({}) is a pure Zod parse —
	// safe to evaluate once here.
	const EMPTY_PATTERN = normalizePattern({});

	const props = withDefaults(defineProps<{
		player?: BeatboxReference;
		tuneName: string;
		patternName: string;
		readonly?: boolean;
		onlyInstrument?: Instrument;
		hidePlaybackControls?: boolean;
		multiLineWhenNarrow?: boolean;
		verdicts?: Map<number, Verdict>;
	}>(), {
		readonly: false,
		hidePlaybackControls: false,
		multiLineWhenNarrow: false
	});

	const i18n = useI18n();

	const visibleInstrumentKeys = computed(() =>
		props.onlyInstrument ? [props.onlyInstrument] : config.instrumentKeys
	);

	// Fall back to a shared empty normalized pattern if the tune/part combo doesn't
	// resolve (e.g. a transiently stale pattern name). Keeps the render pure instead of
	// throwing on `pattern.value.length`. Valid callers (Listen/Compose) always resolve
	// a real pattern, so this fallback is inert for them.
	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName) ?? EMPTY_PATTERN);

	const playerRef = ref<BeatboxReference>(props.player || createBeatbox(true));
	const playbackSettings = ref<PlaybackSettings>({
		...normalizePlaybackSettings(state.value.playbackSettings),
		speed: pattern.value.speed,
		loop: pattern.value.loop
	});
	const currentStrokeDropdown = ref<StrokeDropdownInfo>();

	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const upbeatBeats = computed(() => Math.ceil(pattern.value.upbeat / pattern.value.time));

	// Multi-line v2: container-width-driven balanced rows.
	// CELL_WIDTH_PX feeds both the row-balancing arithmetic (naturalWidth) and the
	// --bb-cell-width CSS custom property (set inline on the container), so all three
	// sites — JS arithmetic, spacer width, and rendered stroke width — share one source.
	const CELL_WIDTH_PX = 30;

	// Tracked container width drives rowCount; updated via ResizeObserver below.
	const containerW = ref(0);

	// rowGroups: balanced split of measures into rows. Rows where rowIdx > 0 AND upbeat > 0
	// get a leadingSpacerCells > 0 so measure 5 aligns column-wise under measure 1, etc.
	const rowGroups = computed(() => {
		if (!props.multiLineWhenNarrow) return [];
		const totalCells = pattern.value.length * pattern.value.time + pattern.value.upbeat;
		const naturalW = totalCells * CELL_WIDTH_PX;
		// Before first measurement (containerW === 0), assume single-line fit.
		const cw = containerW.value || naturalW;
		const rowCount = naturalW <= cw ? 1 : Math.ceil(naturalW / cw);
		const measuresPerRow = Math.ceil(pattern.value.length / rowCount);

		const groups: { rowIdx: number; leadingSpacerCells: number; measures: { index: number; startStrokeIdx: number; cellCount: number }[] }[] = [];
		for (let r = 0; r < rowCount; r++) {
			const startMeasure = r * measuresPerRow;
			const endMeasure = Math.min(startMeasure + measuresPerRow, pattern.value.length);
			const measures: { index: number; startStrokeIdx: number; cellCount: number }[] = [];
			for (let m = startMeasure; m < endMeasure; m++) {
				if (m === 0) {
					measures.push({ index: 0, startStrokeIdx: 0, cellCount: pattern.value.upbeat + pattern.value.time });
				} else {
					measures.push({ index: m, startStrokeIdx: pattern.value.upbeat + m * pattern.value.time, cellCount: pattern.value.time });
				}
			}
			// Skip empty trailing groups: when measuresPerRow packs all measures into fewer than
			// rowCount rows (e.g. length 4, rowCount 3 → [0,1][2,3]), the last iterations have no
			// measures — pushing them would render a stray empty row.
			if (measures.length > 0) {
				groups.push({
					rowIdx: r,
					leadingSpacerCells: (r > 0 && pattern.value.upbeat > 0) ? pattern.value.upbeat : 0,
					measures
				});
			}
		}
		return groups;
	});

	// ResizeObserver lifecycle: attach when multi-line mode is on, disconnect when off or unmounting.
	let resizeObserver: ResizeObserver | null = null;

	function attachResizeObserver() {
		if (!props.multiLineWhenNarrow || !containerRef.value) return;
		if (!resizeObserver) {
			resizeObserver = new ResizeObserver((entries) => {
				const w = entries[0]?.contentRect.width;
				if (typeof w === "number") containerW.value = w;
			});
		}
		resizeObserver.observe(containerRef.value);
		containerW.value = containerRef.value.offsetWidth;
	}

	function detachResizeObserver() {
		resizeObserver?.disconnect();
		resizeObserver = null;
	}

	onMounted(() => { attachResizeObserver(); });
	onBeforeUnmount(() => { detachResizeObserver(); });
	watch(() => props.multiLineWhenNarrow, (enabled) => {
		if (enabled) attachResizeObserver();
		else detachResizeObserver();
	});

	const containerRef = ref<HTMLElement>();
	const abstractPlayerRef = ref<InstanceType<typeof AbstractPlayer>>();

	watch([
		() => playbackSettings.value.volume,
		() => playbackSettings.value.volumes
	], () => {
		if(playbackSettings.value.volume != state.value.playbackSettings.volume || !isEqual(playbackSettings.value.volumes, state.value.playbackSettings.volumes)) {
			updatePlaybackSettings(state.value.playbackSettings, {
				volume: playbackSettings.value.volume,
				volumes: playbackSettings.value.volumes
			});
		}
	}, { deep: true });

	watch([
		() => state.value.playbackSettings.volume,
		() => state.value.playbackSettings.volumes
	], () => {
		if(playbackSettings.value.volume != state.value.playbackSettings.volume || !isEqual(playbackSettings.value.volumes, state.value.playbackSettings.volumes)) {
			playbackSettings.value.volume = state.value.playbackSettings.volume;
			playbackSettings.value.volumes = clone(state.value.playbackSettings.volumes);
		}
	}, { deep: true });

	const rawPattern = computed(() => patternToBeatbox(pattern.value, playbackSettings.value));

	const handlePosition = ({ beat }: PositionData) => {
		if(beat == null) {
			containerRef.value!.querySelector(".beat.active")?.classList.remove("active");
		} else {
			const activeBeat = containerRef.value!.querySelector(".beat.active");
			const beatEl = containerRef.value!.querySelector(`.beat-i-${Math.floor(beat)}`);
			if (activeBeat && activeBeat !== beatEl) {
				activeBeat.classList.remove("active");
			}
			if (beatEl && beatEl !== activeBeat) {
				beatEl.classList.add("active");
			}
		}
	};

	const getPositionMarkerLeft = ({ beat }: PositionData<false>) => {
		const stroke = beat * pattern.value.time;
		const strokeIdx = Math.floor(stroke);
		const strokeEl = containerRef.value!.querySelector<HTMLElement>(".stroke-i-"+strokeIdx);
		return strokeEl ? (strokeEl.offsetLeft + strokeEl.offsetWidth * (stroke - strokeIdx)) : 0;
	};

	const getBeatClass = (i: number) => {
		let positiveI = i;
		while(positiveI < 0) // Support negative numbers properly
			positiveI += 4;

		const ret = [ "beat-"+(positiveI%4), "beat-i-"+i ];
		if(positiveI%4 == 3)
			ret.push("before-bar");
		if(positiveI%4 == 0)
			ret.push("after-bar");
		return ret;
	};

	const getStrokeClass = (realI: number, instrumentKey: Instrument) => {
		let i = realI - pattern.value.upbeat;

		const ret = [
			"stroke-"+(i%pattern.value.time),
			"stroke-i-"+i
		];
		if((i+1)%pattern.value.time == 0)
			ret.push("before-beat");
		if(i%pattern.value.time == 0)
			ret.push("after-beat");
		if((i+1)%(pattern.value.time*4) == 0)
			ret.push("before-bar");
		if(i%(pattern.value.time*4) == 0)
			ret.push("after-bar");

		if(originalPattern.value && (originalPattern.value[instrumentKey][realI] || "").trim() != (pattern.value[instrumentKey][realI] || "").trim())
			ret.push("has-changes");

		return ret;
	};

	const setPosition = (event: MouseEvent) => {
		let tr = event.target instanceof HTMLElement ? event.target.closest("tr") : undefined;
		let firstBeat = tr?.querySelector("td.beat");

		if (tr && firstBeat) {
			let patternLength = pattern.value.length * config.playTime + pattern.value.upbeat * config.playTime / pattern.value.time;
			const trRect = tr.getBoundingClientRect();
			const beatRect = firstBeat.getBoundingClientRect();
			let pos = Math.floor(patternLength * (event.clientX - beatRect.left) / (tr.offsetWidth - beatRect.left + trRect.left));
			abstractPlayerRef.value!.setPosition(pos);
		}
	};

	const hasLocalChanges = computed(() => originalPattern.value && !patternEquals(originalPattern.value, pattern.value));

	const reset = async () => {
		if(await showConfirm({
			title: () => i18n.t("pattern-player.restore-title"),
			message: () => i18n.t("pattern-player.restore-message"),
			variant: "warning",
			okLabel: () => i18n.t("pattern-player.restore-ok")
		}))
			createPattern(state.value, props.tuneName, props.patternName, originalPattern.value || undefined);
	};

	const clickStroke = (instrumentKey: Instrument, i: number) => {
		if(isEqual(currentStrokeDropdown.value, { instr: instrumentKey, i }))
			closeStrokeDropdown();
		else {
			openStrokeDropdown({ instr: instrumentKey, i });
		}
	};

	const onStrokeChange = (newStroke: string, prev: boolean) => {
		if(currentStrokeDropdown.value && (!prev || currentStrokeDropdown.value.i > 0))
			updateStroke(pattern.value, currentStrokeDropdown.value.instr, currentStrokeDropdown.value.i - (prev ? 1 : 0), newStroke);
	};

	const onStrokePrevNext = (previous: boolean = false) => {
		if(!currentStrokeDropdown.value || previous && currentStrokeDropdown.value.i == 0 || !previous && currentStrokeDropdown.value.i >= pattern.value.length*pattern.value.time - 1)
			return currentStrokeDropdown.value = undefined;

		openStrokeDropdown({
			instr: currentStrokeDropdown.value.instr,
			i: currentStrokeDropdown.value.i + (previous ? -1 : 1)
		});
	};

	const strokeDropdownRef = ref<HTMLElement>();
	const strokeDropdownPopover = ref<CustomPopover>();

	const openStrokeDropdown = (info: StrokeDropdownInfo) => {
		currentStrokeDropdown.value = info;
	};

	const closeStrokeDropdown = () => {
		currentStrokeDropdown.value = undefined;
	};

	watch(currentStrokeDropdown, () => {
		if (strokeDropdownPopover.value) {
			strokeDropdownPopover.value.dispose();
			strokeDropdownPopover.value = undefined;
		}

		void nextTick(() => {
			if (currentStrokeDropdown.value) {
				strokeDropdownPopover.value = new CustomPopover(`#bb-pattern-player-stroke-${currentStrokeDropdown.value.instr}-${currentStrokeDropdown.value.i}`, { content: strokeDropdownRef.value!, placement: 'bottom' });
				strokeDropdownPopover.value.show();
			}
		});
	}, { immediate: true });
</script>

<template>
	<div>
		<PatternPlayerToolbar
			:tuneName="tuneName"
			:patternName="patternName"
			:player="playerRef"
			v-model:playbackSettings="playbackSettings"
			:readonly="readonly"
		>
			<slot />

			<button v-if="hasLocalChanges" type="button" class="btn btn-warning" @click="reset()"><fa icon="eraser"/>{{" "}}{{i18n.t("pattern-player.restore")}}</button>
		</PatternPlayerToolbar>

		<div class="bb-pattern-player-container" :class="{ 'multi-line-when-narrow': props.multiLineWhenNarrow }" :style="{ '--bb-cell-width': CELL_WIDTH_PX + 'px' }" ref="containerRef">
			<table v-if="!props.multiLineWhenNarrow" class="bb-pattern-player" :class="`time-${pattern.time}`">
				<thead>
					<tr>
						<td :colspan="hidePlaybackControls ? 1 : 2" :class="{ 'instrument-operations': !hidePlaybackControls }">
							<MuteButton v-if="!hidePlaybackControls" instrument="all" v-model:playbackSettings="playbackSettings"/>
						</td>
						<td v-for="i in upbeatBeats" :key="i" :colspan="i == 1 ? (pattern.upbeat-1) % pattern.time + 1 : pattern.time" class="beat" :class="getBeatClass(i-1 - upbeatBeats)" @click="setPosition($event)"><span>{{i - upbeatBeats}}</span></td>
						<td v-for="i in pattern.length" :key="i" :colspan="pattern.time" class="beat" :class="getBeatClass(i-1)" @click="setPosition($event)"><span>{{i}}</span></td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="instrumentKey in visibleInstrumentKeys" :key="instrumentKey" v-bind="{ 'data-instrument': instrumentKey }">
						<th>{{config.instruments[instrumentKey].name()}}</th>
						<td class="instrument-operations" v-if="!hidePlaybackControls">
							<HeadphonesButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" groupSurdos />
							<MuteButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" />
						</td>
						<StrokeCell
							v-for="i in pattern.length*pattern.time + pattern.upbeat"
							:key="i"
							:rawIdx="i-1"
							:instrumentKey="instrumentKey"
							:readonly="readonly"
							:char="config.strokes[pattern[instrumentKey][i-1]] || '\xa0'"
							:cellClass="getStrokeClass(i-1, instrumentKey)"
							:tooltip="config.strokesDescription[pattern[instrumentKey][i-1]]?.() || ''"
							:verdict="props.verdicts?.get((i - 1) - pattern.upbeat)"
							@strokeClick="clickStroke(instrumentKey, i-1)"
						/>
					</tr>
				</tbody>
			</table>

			<div v-else class="bb-pattern-player-rows">
				<div v-for="row in rowGroups" :key="row.rowIdx" class="bb-pattern-player-row">
					<div v-if="row.leadingSpacerCells > 0" class="bb-pattern-player-row-spacer" :style="{ width: (row.leadingSpacerCells * CELL_WIDTH_PX) + 'px' }"></div>
					<table v-for="measure in row.measures" :key="measure.index" class="bb-pattern-player bb-pattern-player-measure" :class="`time-${pattern.time}`">
						<thead>
							<tr>
								<td v-if="!hidePlaybackControls" :colspan="1" class="instrument-operations">
									<MuteButton v-if="measure.index === 0" instrument="all" v-model:playbackSettings="playbackSettings"/>
								</td>
								<template v-if="measure.index === 0 && pattern.upbeat > 0">
									<td v-for="i in upbeatBeats" :key="`up-${i}`" :colspan="i == 1 ? (pattern.upbeat-1) % pattern.time + 1 : pattern.time" class="beat" :class="getBeatClass(i-1 - upbeatBeats)" @click="setPosition($event)"><span>{{i - upbeatBeats}}</span></td>
								</template>
								<td :colspan="pattern.time" class="beat" :class="getBeatClass(measure.index)" @click="setPosition($event)"><span>{{measure.index + 1}}</span></td>
							</tr>
						</thead>
						<tbody>
							<tr v-for="instrumentKey in visibleInstrumentKeys" :key="instrumentKey" v-bind="{ 'data-instrument': instrumentKey }">
								<td class="instrument-operations" v-if="!hidePlaybackControls">
									<HeadphonesButton v-if="measure.index === 0" :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" groupSurdos />
									<MuteButton v-if="measure.index === 0" :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" />
								</td>
								<StrokeCell
									v-for="i in measure.cellCount"
									:key="i"
									:rawIdx="measure.startStrokeIdx + i - 1"
									:instrumentKey="instrumentKey"
									:readonly="readonly"
									:char="config.strokes[pattern[instrumentKey][measure.startStrokeIdx + i - 1]] || '\xa0'"
									:cellClass="getStrokeClass(measure.startStrokeIdx + i - 1, instrumentKey)"
									:tooltip="config.strokesDescription[pattern[instrumentKey][measure.startStrokeIdx + i - 1]]?.() || ''"
									:verdict="props.verdicts?.get((measure.startStrokeIdx + i - 1) - pattern.upbeat)"
									@strokeClick="clickStroke(instrumentKey, measure.startStrokeIdx + i - 1)"
								/>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<AbstractPlayer
				:player="playerRef"
				:rawPattern="rawPattern"
				:playbackSettings="playbackSettings"
				:getLeft="getPositionMarkerLeft"
				@position="handlePosition"
				ref="abstractPlayerRef"
			/>

			<div v-if="currentStrokeDropdown" class="popover bs-popover-auto fade" ref="strokeDropdownRef">
				<div class="popover-arrow"></div>
				<div class="popover-body">
					<StrokeDropdown :instrument="currentStrokeDropdown.instr" :model-value="pattern[currentStrokeDropdown.instr][currentStrokeDropdown.i] || ' '" @change="onStrokeChange($event, false)" @change-prev="onStrokeChange($event, true)" @prev="onStrokePrevNext(true)" @next="onStrokePrevNext(false)" @close="closeStrokeDropdown()" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-pattern-player-container {
		width: 100%;
		overflow-x: auto;
		padding: 1em 0;
		position: relative;

		// Multi-line v2: JS-computed balanced rows, column-aligned via fixed cell width.
		// Each row is a horizontal flex container of measure-tables, optionally prefixed by
		// a leading spacer (for rows 2+ when the pattern has an upbeat — aligns measure 5
		// column-wise under measure 1, etc.).
		&.multi-line-when-narrow {
			.bb-pattern-player-rows {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			.bb-pattern-player-row {
				display: flex;
				flex-direction: row;
				align-items: flex-start;
				gap: 0;
			}
			.bb-pattern-player-row-spacer {
				flex-shrink: 0;
				// width is set inline from rowGroups (leadingSpacerCells * CELL_WIDTH_PX).
			}
			.bb-pattern-player-measure {
				flex: 0 0 auto;
			}
			// Fixed cell width — alignment across measure-tables/rows depends on this.
			.stroke {
				width: var(--bb-cell-width);
			}
			// Hide the sweep marker overlay — the per-beat .beat.active highlight provides
			// position feedback, and the overlay's x-position assumes a single table.
			.bb-position-marker {
				display: none !important;
			}
		}

		.bb-pattern-player {
			table-layout: fixed;

			.stroke {
				border-right: 1px solid var(--bs-border-color);
				text-align: center;
				position: relative;

				&.has-changes {
					background-color: var(--bb-modified);
				}
			}

			.stroke-inner {
				display: inline-block;
				min-width: 2.7ex;
				min-height: 1em;
				text-decoration: none;
				color: inherit;
			}

			thead td {
				border-bottom: 1px solid var(--bb-strong-border-color);
				padding-bottom: .5ex;
			}

			.beat, .stroke.before-beat {
				border-right: 1px solid var(--bb-strong-border-color);
			}

			.instrument-operations, .stroke.before-bar, .beat.before-bar {
				border-right: 2px solid var(--bb-strong-border-color);
			}

			.instrument-operations {
				text-align: right;

				a + a {
					margin-left: 0.25rem;
				}
			}

			.beat {
				cursor: pointer;
			}

			.beat span {
				display: inline-block;
				padding: 0 .5ex;
				border-radius: 10px;
				transition: background-color 1s, color 1s;
			}

			.beat.active span {
				background-color: var(--bb-active-beat-bg);
				color: var(--bb-active-beat-color);
				transition: none;
			}

			tbody th {
				padding-right: 1ex;
			}

			tbody th, td.instrument-operations {
				white-space: nowrap;
			}

			&.time-2 {
				.stroke-inner {
					min-width: 5.4ex;
				}
			}

			&.time-12 {
				.stroke-inner {
					min-width: 1ex;
				}

				.stroke-0, .stroke-1, .stroke-3, .stroke-4, .stroke-6, .stroke-7, .stroke-9, .stroke-10 {
					border-right: none;
				}
			}

			&.time-20 {
				.stroke-inner {
					min-width: 1ex;
				}

				.stroke-0, .stroke-1, .stroke-2, .stroke-3,
				.stroke-5, .stroke-6, .stroke-7, .stroke-8,
				.stroke-10,.stroke-11,.stroke-12,.stroke-13,
				.stroke-15,.stroke-16,.stroke-17,.stroke-18 {
					border-right: none;
				}
			}
		}
	}
</style>