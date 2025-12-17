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
	import { patternEquals, updateStroke } from "../../state/pattern";
	import { normalizePlaybackSettings, PlaybackSettings, updatePlaybackSettings } from "../../state/playbackSettings";
	import { createPattern, getPatternFromState } from "../../state/state";
	import { clone } from "../../utils";
	import defaultTunes from "../../defaultTunes";
	import { isEqual } from "lodash-es";
	import StrokeDropdown from "./stroke-dropdown.vue";
	import { injectStateRequired } from "../../services/state";
	import { computed, nextTick, ref, watch } from "vue";
	import { showConfirm } from "../utils/alert";
	import vTooltip from "../utils/tooltip";
	import { CustomPopover } from "../utils/popover.vue";
	import PatternPlayerToolbar from "./pattern-player-toolbar.vue";
	import MuteButton from "../playback-settings/mute-button.vue";
	import HeadphonesButton from "../playback-settings/headphones-button.vue";
	import AbstractPlayer, { PositionData } from "../utils/abstract-player.vue";
	import { useI18n } from "../../services/i18n";

	type StrokeDropdownInfo = {
		instr: Instrument,
		i: number,
		sequence?: string
	};

	const state = injectStateRequired();

	const props = withDefaults(defineProps<{
		player?: BeatboxReference;
		tuneName: string;
		patternName: string;
		readonly?: boolean;
	}>(), {
		readonly: false
	});

	const i18n = useI18n();

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName)!);

	const playerRef = ref<BeatboxReference>(props.player || createBeatbox(true));
	const playbackSettings = ref<PlaybackSettings>({
		...normalizePlaybackSettings(state.value.playbackSettings),
		speed: pattern.value.speed,
		loop: pattern.value.loop
	});
	const currentStrokeDropdown = ref<StrokeDropdownInfo>();

	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const upbeatBeats = computed(() => Math.ceil(pattern.value.upbeat / pattern.value.time));

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


	// If there is no upbeat, beatI goes from 0 to length - 1.
	// If there is an upbeat, beatI goes from floor(-upbeat/time) to length - 1.
	const isTernaryBeat = (instrumentKey: Instrument, beatI: number) => {
		const patternForInstrument = pattern.value[instrumentKey];
		const hasNote = (j: number) => {
			// pattern is an array so its indexes start at 0, not -upbeat.
			const realJ = j + pattern.value.upbeat;
			return patternForInstrument[realJ] !== undefined && patternForInstrument[realJ] !== null && patternForInstrument[realJ] !== " ";
		}
		const firstStrokeInBeat = beatI * pattern.value.time;
		const lastStrokeInBeat = firstStrokeInBeat + pattern.value.time - 1;
		for (let strokeNum = firstStrokeInBeat; strokeNum <= lastStrokeInBeat; strokeNum++) {
			if (strokeNum%3 !==0 && hasNote(strokeNum)) {
				return true;
			}
		}
		return false;
	}
	const beatIFromStrokeI = (strokeI: number) => {
		return Math.floor(strokeI/pattern.value.time);
	}
	// For each instrument, for each stroke, return the CSS class to apply to the stroke : "" or "is-triplet".
	const ternaryCSSClasses = computed(() => {
		const ret = {} as Record<Instrument, Record<number, string>>;
		for (let instrumentKey of config.instrumentKeys) {
			ret[instrumentKey] = {};
		}
		// We only support 12 and 24 time signatures for now.
		if(![12, "12", 24, "24"].includes(pattern.value.time)) return ret;
		const ternaryClassesForInstrument = (instrumentKey: Instrument) => {
			const areBeatsTernary: Record<number, boolean> = {};
			for (let beatI = beatIFromStrokeI(-pattern.value.upbeat); beatI < pattern.value.length; beatI++) {
				areBeatsTernary[beatI] = isTernaryBeat(instrumentKey, beatI);
			}
			const ternaryCSSClassesForInstrument: Record<number, string> = {};
			for (let strokeI = -pattern.value.upbeat; strokeI < pattern.value.length*pattern.value.time + pattern.value.upbeat; strokeI++) {
				ternaryCSSClassesForInstrument[strokeI] = areBeatsTernary[beatIFromStrokeI(strokeI)] ? 'is-triplet' : '';
			}
			return ternaryCSSClassesForInstrument;
		}
		for (let instrumentKey of config.instrumentKeys) {
			ret[instrumentKey] = ternaryClassesForInstrument(instrumentKey);
		}
		return ret;
	});

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
		// realI starts at 0, even if there is an upbeat.
		// i goes from -upbeat to length*time - 1.
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

		nextTick(() => {
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

		<div class="bb-pattern-player-container" ref="containerRef">
			<table class="bb-pattern-player" :class="[`time-${pattern.time}`, readonly ? 'listen' : 'compose']" translate="no">
				<thead>
					<tr>
						<td colspan="2" class="instrument-operations">
							<MuteButton instrument="all" v-model:playbackSettings="playbackSettings"/>
						</td>
						<td v-for="i in upbeatBeats" :key="i" :colspan="i == 1 ? (pattern.upbeat-1) % pattern.time + 1 : pattern.time" class="beat" :class="getBeatClass(i-1 - upbeatBeats)" @click="setPosition($event)"><span>{{i - upbeatBeats}}</span></td>
						<td v-for="i in pattern.length" :key="i" :colspan="pattern.time" class="beat" :class="getBeatClass(i-1)" @click="setPosition($event)"><span>{{i}}</span></td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
						<th>{{config.instruments[instrumentKey].name()}}</th>
						<td class="instrument-operations">
							<HeadphonesButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" groupSurdos />
							<MuteButton :instrument="instrumentKey" v-model:playbackSettings="playbackSettings" />
						</td>
						<td v-for="i in pattern.length*pattern.time + pattern.upbeat" :key="i" class="stroke" :class="getStrokeClass(i-1, instrumentKey).concat(ternaryCSSClasses[instrumentKey][i-1-pattern.upbeat])" v-tooltip="config.strokesDescription[pattern[instrumentKey][i-1]]?.() || ''">
							<span v-if="readonly" class="stroke-inner">{{config.strokes[pattern[instrumentKey][i-1]]}}</span>
							<a v-if="!readonly"
								href="javascript:" class="stroke-inner"
								:id="`bb-pattern-player-stroke-${instrumentKey}-${i-1}`"
								@click="clickStroke(instrumentKey, i-1)"
								draggable="false"
							>
								{{config.strokes[pattern[instrumentKey][i-1]] || '\xa0'}}
							</a>
						</td>
					</tr>
				</tbody>
			</table>

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

		.bb-pattern-player {
			table-layout: fixed;

			.stroke {
				text-align: center;
				position: relative;
				overflow: visible;
				padding: 0;

				.stroke-inner {
					color: rgb(33, 37, 41);
				}

				&.is-triplet .stroke-inner {
					color: var(--bs-pink);
				}

				&.has-changes {
					background-color: #fbe8d0;
				}
			}

			&.compose {
				.stroke {
					border-right: 1px solid #f3f3f3;
				}
			}

			&.listen {
				.stroke {
					border-right: 1px solid #ffffff;
				}
			}

			&.listen tr:last-child {
				.stroke-inner:not(:empty) {
					/* Shouting: Hide table lines behind overlapping text */
					background-color: #fff;
				}
			}

			.stroke-inner {
				display: inline-block;
				min-width: 2.7ex;
				min-height: 1em;
				text-decoration: none;
			}

			thead td {
				border-bottom: 1px solid #aaa;
				padding-bottom: .5ex;
			}

			.beat, .stroke.before-beat {
				border-right: 1px solid #aaa;
			}

			.instrument-operations, .stroke.before-bar, .beat.before-bar {
				border-right: 2px solid #888;
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
				background-color: #3a94a5;
				color: #fff;
				transition: none;
			}

			tbody th {
				padding-right: 1ex;
			}

			tbody th, td.instrument-operations {
				white-space: nowrap;
			}
		}

		.bb-pattern-player {

			&.time-2 { /* 64px/beat */
				.stroke { max-width: 32px; }
				.stroke-inner { min-width: 32px; }
			}

			&.time-3 { /* 63px/beat */
				.stroke { max-width: 21px; }
				.stroke-inner { min-width: 21px; }
			}

			&.time-4 { /* 64px/beat */
				.stroke { max-width: 16px; }
				.stroke-inner { min-width: 16px; }
			}

			&.time-5 { /* 65px/beat */
				.stroke { max-width: 13px; }
				.stroke-inner { min-width: 13px; }
			}

			&.time-6 { /* 66px/beat */
				.stroke { max-width: 11px; }
				.stroke-inner { min-width: 11px; }
			}

			&.time-8 { /* 76px/beat */
				.stroke { max-width: 9.5px; }
				.stroke-inner { min-width: 9.5px; }
			}

			&.time-9 { /* 76.5px/beat */
				.stroke { max-width: 8.5px; }
				.stroke-inner { min-width: 8.5px; }
			}

			&.time-12.compose,
			&.time-16.compose,
			&.time-20.compose,
			&.time-24.compose {
				.stroke { max-width: 8px; }
				.stroke-inner { min-width: 8px; }
			}

			&.time-12.listen { /* 78px/beat */
				.stroke { max-width: 6.5px; }
				.stroke-inner { min-width: 6.5px; }
			}

			&.time-16.listen { /* 80px/beat */
				.stroke { max-width: 5px; }
				.stroke-inner { min-width: 5px; }
			}

			&.time-20.listen { /* 80px/beat */
				.stroke { max-width: 4px; }
				.stroke-inner { min-width: 4px; }
			}

			&.time-24.listen { /* 84px/beat */
				.stroke { max-width: 3.5px; }
				.stroke-inner { min-width: 3.5px; }
			}

			&.time-2 {
				.stroke-0 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-3 {
				.stroke--2, .stroke-0, .stroke-1 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-4 {
				.stroke--2, .stroke--3,
				.stroke-0, .stroke-1, .stroke-2 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-5 {
				.stroke--2, .stroke--3, .stroke--4,
				.stroke-0, .stroke-1, .stroke-2, .stroke-3 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-6 {
				.stroke--3, .stroke--5,
				.stroke-1,  .stroke-3, {
					border-right: 1px solid #ddd;
				}
			}

			&.time-8 {
				.stroke--3, .stroke--5, .stroke--7,
				.stroke-1,  .stroke-3,  .stroke-5 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-9 {
				.stroke--4, .stroke--7,
				.stroke-2,  .stroke-5 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-12 {
				.stroke:not(.is-triplet) {
					&.stroke--4, &.stroke--7, &.stroke--10,
					&.stroke-2,  &.stroke-5,  &.stroke-8 {
						border-right: 1px solid #ddd;
					}
				}
				.stroke.is-triplet {
					&.stroke--5, &.stroke--9,
					&.stroke-3,  &.stroke-7 {
						border-right: 1px solid #ddd;
					}
				}
			}

			&.time-16 {
				.stroke--5, .stroke--9, .stroke--13,
				.stroke-3,  .stroke-7,  .stroke-11 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-20 {
				.stroke--6, .stroke--11, .stroke--16,
				.stroke-4,  .stroke-9,   .stroke-14 {
					border-right: 1px solid #ddd;
				}
			}

			&.time-24 {
				.stroke:not(.is-triplet) {
					&.stroke--7, &.stroke--13, &.stroke--19,
					&.stroke-5,  &.stroke-11,  &.stroke-17 {
						border-right: 1px solid #ddd;
					}
				}
				.stroke.is-triplet {
					&.stroke--9, &.stroke--17,
					&.stroke-7,  &.stroke-15 {
						border-right: 1px solid #ddd;
					}
				}
			}
		}
	}
</style>
